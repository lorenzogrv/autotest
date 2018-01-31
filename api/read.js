var PassThrough = require('stream').PassThrough
var StringDecoder = require('string_decoder').StringDecoder

var abc = require('iai-abc')
var log = abc.log
/**
 * reads characters from any readable stream
 * if !n, it will read until \n (or opts.splitter) is found (and strip it)
 */

module.exports = read

function read (stream, opts, callback) {
  opts = opts || {}
  // opts.t = opts.t || 2000; //TODO use timeout by default?
  if (!opts.n) opts.splitter = opts.splitter || '\n'
  log.info('READ STREAM', opts, 'Begin')

  stream = stream || process.stdin
  // TODO do not force encoding if none given (so reading n-bytes)¿?
  var decoder = new StringDecoder('utf8')
  var result = ''
  var output = new PassThrough()

  if (opts.n && stream === process.stdin) {
    stream.setRawMode(true)
    log.info('READ STDIN', opts, 'raw mode enabled')
    // TODO Move this behaviour to a iai.cleanup function
    // taken from http://stackoverflow.com/a/21947851/1894803
    process.on('exit', function (code) {
      stream.setRawMode(false)
      log.info('READ STDIN', opts, 'raw mode disabled')
      output.end()
      code && log.error('READ STDIN', opts, 'main proces EXIT', code)
    })
  }

  stream.on('readable', _read)

  if (opts.t) {
    var to
    function forgiveTimeout () { clearTimeout(to) }
    function refreshTimeout () {
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

  return output

  function _read () {
    var chunk
    while ((chunk = stream.read(opts.n)) !== null) {
      // TODO do not force encoding if none given (so reading n-bytes)¿?
      var str = decoder.write(chunk)

      var remain = false
      if (opts.n && opts.n >= (result.length + str.length)) {
        // read -n strategy: read by length
        var slice = str.slice(0, opts.n - result.length)
        result += slice
        remain = str.slice(slice.length)
      } else if (~str.indexOf(opts.splitter)) {
        // read "line" strategy: read until splitter is found
        var split = str.split(opts.splitter)
        result += split.shift()
        remain = split.join(opts.splitter)
      }
      if (remain === false) {
        result += str
        continue
      }
      // unshift if we get too much
      if (remain.length) {
        log.verb('remain', remain)
        stream.unshift(new Buffer(remain, 'utf8'))
      }
      // this can be commented but it avoids uneccesary calls
      // TODO decide if empty result pushes as splitter
      if (!result) { log.debug('skiping empty splitter'); continue }
      // check for ^C
      if (~result.indexOf('\u0003')) {
        log.debug('READ', opts, 'Push null (^C)')
        output.push(null)
        return
      }
      // finish
      log.debug('READ', opts, 'Push', JSON.stringify(result))
      output.push(result)
      result = ''
    }
  }
}
