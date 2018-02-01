const { PassThrough, Readable } = require('stream')
const Aslice = Array.prototype.slice

const abc = require('iai-abc')
const log = abc.log
log.level = abc.Log.VERB

/**
 * reads data from any readable stream
 *    opts.stream (stream to read from) defaults to process.stdin
 * if opts.n is given, it will read n bytes
 * if opts.n is falsy, it will read until opts.splitter is found
 *    opts.splitter defaults to 13 (enter key)
 * TODO opts.strip => removes splitter from output
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
  // don't use timeout by default
  opts.t = opts.t || 0
  // read -n strategy vs read-by-line strategy
  if (!opts.n) {
    opts.splitter = opts.splitter || 13
    delete opts.n // ensure opts.n is undefined
  }

  var stream = opts.stream || process.stdin
  var output = new PassThrough()

  delete opts.stream
  log.info('READ STREAM', opts, 'Begin')

  if (stream === process.stdin) {
    stream.setRawMode(true)
    log.info('READ STDIN', opts, 'raw mode enabled')
    // TODO Move this behaviour to a iai.cleanup function
    // basics from http://stackoverflow.com/a/21947851/1894803
    var disableRaw = function () {
      stream.setRawMode(false)
      log.info('READ STDIN', opts, 'raw mode disabled')
    }
    var onExit = function (code) {
      disableRaw()
      code && log.error('READ STDIN', opts, 'main proces EXIT', code)
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
      log.debug('READ', opts, 'Timeout in', opts.t)
      to = setTimeout(function () {
        forgiveTimeout()
        var error = new Error('READ TIMEOUT')
        error.code = 'READ_TIMEOUT'
        log.warn('READ', opts, 'TIMEOUT!')
        output.emit('error', error)
        output.end()
      }, opts.t)
    }
    refreshTimeout()
    stream.on('readable', refreshTimeout)
    output.on('end', function () {
      forgiveTimeout()
      log.debug('READ', opts, 'Timeout stops')
      stream.removeListener('readable', refreshTimeout)
    })
  }

  callback && output.once('readable', function () {
    // read-once logic
    this.end()
    callback(null, this.read().toString('utf8'))
  })

  stream.on('end', output.end.bind(output))
  output.on('end', function () {
    stream.removeListener('readable', _read)
    log.info('READ STREAM', opts, 'End')
  })

  var result = []
  return output

  function _read () {
    var chunk
    while ((chunk = stream.read(opts.n)) !== null) {
      // detect user interrupt via ^C
      // TODO ^C detection should be deactivable via options
      if (~chunk.indexOf(3)) {
        log.debug('READ', opts, 'Push null (^C)')
        output.push(null)
        return
      }
      var remain = false
      // we may get too much, either reading by n-bytes or by line
      if (opts.n && opts.n >= (result.length + chunk.length)) {
        // read -n strategy: read by length (n bytes)
        var slice = Aslice.call(chunk, 0, opts.n - result.length)
        result = result.concat(slice)
        remain = chunk.slice(slice.length)
      } else if (~chunk.indexOf(opts.splitter)) {
        // read "line" strategy: read until splitter is found
        var split = Aslice.call(chunk, 0, chunk.indexOf(opts.splitter))
        // TODO if splitter should be striped, don't concat it
        result = result.concat(split, opts.splitter)
        remain = chunk.slice(split.length + 1)
      }
      // unshift if we got too much
      if (remain.length) {
        log.verb('remain %j', Aslice.call(remain))
        stream.unshift(remain)
      }
      if (remain === false) {
        result = result.concat(Aslice.call(chunk))
        log.verb('still reading %j', result)
        continue
      }
      // finish reading this (push result)
      log.debug('READ %j Push %j', opts, result)
      output.push(Buffer.from(result))
      result = []
    }
  }
}
