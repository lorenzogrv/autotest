const { PassThrough, Readable } = require('stream')
const Aslice = Array.prototype.slice

const abc = require('iai-abc')
const log = abc.log
log.level = abc.Log.WARN

/**
 * reads keyboard strokes from any readable stream
 *    opts.stream (stream to read from) defaults to process.stdin
 * if opts.t is given, it will timeout reading after 't' ms
 * if callback is given, reads only once
 * returns ReadableStream
 */

module.exports = readkeys

function readkeys (opts, callback) {
  if (opts instanceof Readable) {
    if (callback && typeof callback !== 'function') throw TypeError('Bad Call')
    opts = { stream: opts }
  }
  opts = opts || {}
  // don't use timeout neither read-by-line by default
  opts.t = opts.t || 0
  opts.line = opts.line || 0
  opts.splitter = opts.splitter || 13

  var stream = opts.stream || process.stdin
  var output = new PassThrough()

  delete opts.stream
  log.info('KEYS STREAM', opts, 'Begin')

  if (stream === process.stdin) {
    stream.setRawMode(true)
    log.info('KEYS STDIN', opts, 'raw mode enabled')
    // TODO Move this behaviour to a iai.cleanup function
    // basics from http://stackoverflow.com/a/21947851/1894803
    var disableRaw = function () {
      stream.setRawMode(false)
      log.info('KEYS STDIN', opts, 'raw mode disabled')
    }
    var onExit = function (code) {
      disableRaw()
      code && log.error('KEYS STDIN', opts, 'main proces EXIT', code)
    }
    process.on('exit', onExit)
    output.on('end', function () {
      disableRaw()
      process.removeListener('exit', onExit)
    })
  }

  stream.on('readable', _read)

  if (opts.t) {
    var to = null
    var forgiveTimeout = function () { clearTimeout(to) }
    var refreshTimeout = function () {
      to && forgiveTimeout()
      log.debug('KEYS STREAM', opts, 'Timeout in', opts.t)
      to = setTimeout(function () {
        forgiveTimeout()
        var error = new Error('READ TIMEOUT')
        error.code = 'READ_TIMEOUT'
        log.warn('KEYS STREAM', opts, 'TIMEOUT!')
        output.emit('error', error)
        output.end()
      }, opts.t)
    }
    refreshTimeout()
    stream.on('readable', refreshTimeout)
    output.on('end', function () {
      forgiveTimeout()
      log.debug('KEYS STREAM', opts, 'Timeout stops')
      stream.removeListener('readable', refreshTimeout)
    })
  }

  callback && output.once('readable', function () {
    // read-once logic
    this.end()
    callback(null, this.read())
  })

  stream.on('end', output.end.bind(output))
  output.on('end', function () {
    stream.removeListener('readable', _read)
    log.info('KEYS STREAM', opts, 'End')
  })

  return output

  function _read () {
    var chunk
    while ((chunk = stream.read()) !== null) {
      // detect user interrupt via ^C
      // TODO ^C detection should be deactivable via options
      if (~chunk.indexOf(3)) {
        log.debug('KEYS', opts, 'Push null (^C)')
        output.push(null)
        return
      }
      // assume each chunk is a keystroke
      log.debug('KEYS %j Push %j', opts, Aslice.call(chunk))
      output.push(keystroke(chunk))
    }
  }
}

// TODO this conversion strategy is still so ugly
const utf8keys = require('./utf8keys')
function keystroke (buffer) {
  if (buffer.length === 1 && buffer[0] === 127) {
    return 'Backspace' // empty string can't be a key
  }
  return utf8keys[buffer.toString('utf8')] || buffer
}
