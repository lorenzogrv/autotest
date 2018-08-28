const { PassThrough, Readable } = require('stream')
const Aslice = Array.prototype.slice

const abc = require('iai-abc')
const log = abc.log
log.level = abc.Log.VERB

/**
 * reads keyboard strokes from any readable stream
 *    opts.input (stream to read from) defaults to process.stdin
 * if opts.t is given, it will timeout reading after 't' ms
 * if callback is given, reads only once
 * returns ReadableStream
 */

module.exports = readkeys

function readkeys (opts) {
  // opts may be only opts.input (set a pipe from given stream)
  if (opts instanceof Readable) opts = { input: opts }

  opts = opts || {}
  // set 'max seconds waiting for input' timeout (disabled by default)
  opts.t = opts.t || 0
  // if opts.input is null (none given), will not pipe any input by default
  opts.input = opts.input || null
  // key code to interpret as 'end of input stream' (defaults to Ctrl+C) to end
  opts.sigint = opts.sigint || 3
  // setting to true will convert input key codes to humanized "key combos"
  opts.humanize = !!opts.humanize

  // this is the transform stream that will be returned
  var output = new PassThrough()
  output._transform = function _go (chunk, encoding, callback) {
    // assume each chunk is a keystroke
    log.debug('keyboard processing %j', Aslice.call(chunk))
    // TODO may be reading buffered data!!
    // if 'chunk is not a key combo' => 'do NOT push data, discard it'
    // apply conversion to human-readable key combo if desired
    callback(null, opts.humanize ? keystroke(chunk) : chunk)
    // line above is the same as `this.push(result); callback(null)`
    // detect 'end of input stream' key code (opts.sigint)
    if (~chunk.indexOf(opts.sigint)) {
      if (this.listeners('focuslost').length) {
        log.info('Focus lost on keycode %j', opts.sigint)
        return this.emit('focuslost')
      }
      log.warn('Ending on keycode %j', opts.sigint)
      return this.end()
    }
  }
  // keeps logs readable
  if (!opts.t) delete opts.t
  if (!opts.input) delete opts.input
  if (!opts.humanize) delete opts.humanize

  log.info('keyboard created: %j', opts)

  // keep record of sources piped in to detect duplications
  var sources = []
  output
    .on('unpipe', source => {
      var sourceId = sources.indexOf(source)
      sources.splice(sourceId, 1)
      log.info('source %s unpiped from output stream', sourceId)
      if (!~sourceId) {
        log.warn('seems that source is not at sources array')
      }
    })
    .on('pipe', source => {
      if (~sources.indexOf(source)) {
        var error = new Error('same source piped in twice')
        error.code = 'KEY_TWICEIN'
        throw error // Fail ASAP
        // return output.emit('error', error)
      }
      log.info('source %s piped into key stream', sources.length)
      sources.push(source)
    })
  output._final = function (callback) {
    if (~sources.indexOf(process.stdin)) {
      log.warn('will pause process.stdin because it is a source')
      process.stdin.pause()
    }
    return callback(null)
  }

  // management of RawMode for sources piped-in (usually process.stdin)
  output.on('pipe', source => {
    // handle RawMode when appropiate
    if (source.setRawMode) {
      var disableRawMode = enableRawMode(source)
      // TODO on 'focuslost' disableRawMode
      output.once('unpipe', src => src === source && disableRawMode())
    }
  })

  if (opts.t) {
    log.info('setting timeout mechanics (t=%s)', opts.t)
    // this is the action that runs when timed out
    var timeout = () => {
      if (output.listeners('timeout').length) {
        output.emit('timeout')
      } else {
        var error = new Error('Keyboard timeout')
        error.code = 'KEY_TIMEOUT'
        output.emit('error', error)
      }
      log.warn('keyboard timed out and will end now!')
      output.end()
    }
    // these are the timeout mechanism internals
    var to = null
    var forgive = () => to && clearTimeout(to)
    var refresh = () => {
      forgive()
      log.debug('keyboard will timeout in %ss', opts.t)
      to = setTimeout(timeout, opts.t * 1000)
    }
    // this is the logic implementing the timeout feature
    output.on('pipe', source => {
      refresh()
      source.on('data', refresh)
      output.once('finish', function () {
        source.removeListener('data', refresh)
        to && forgive()
        log.debug('keyboard stoped timeout forever')
      })
    })
  }

  // informational messages
  output
    // writable interface (input data)
    .on('close', () => log.info('output stream has closed'))
    .on('drain', () => log.verb('output stream has drained'))
    .on('finish', () => log.verb('output stream has finished'))
    // readable interface (output data)
    .on('end', () => log.verb('output stream has end'))
    // .on('readable', () => log.info('output stream becomes readable'))

  return opts.input ? opts.input.pipe(output) : output
}

// TODO this conversion strategy is still so ugly
const utf8keys = require('./utf8keys')
// const { format } = require('util')
function keystroke (buffer) {
  if (buffer.length === 1 && buffer[0] === 127) {
    return 'Backspace' // empty string can't be a key
  }
  return utf8keys[buffer.toString('utf8')] || buffer.toString('utf8')
}

// this depends on iai-abc process bindings:
// - to detect uncaughException via 'exit' event on process
// - to rely on default binding for SIGINT event on process
// basics from http://stackoverflow.com/a/21947851/1894803
// TODO does this belong here?
function enableRawMode (stream) {
  if (!stream.setRawMode) {
    throw new TypeError('this stream does not seem to support raw mode')
  }
  stream.setRawMode(true)
  log.warn('raw mode enabled')
  var disable = () => {
    log.warn('raw mode disabled')
    stream.setRawMode(false)
  }
  var trap = (code) => {
    log[code ? 'warn' : 'verb']('Caught exit with code %s', code)
    disable()
  }
  process.on('exit', trap)
  // returned function should be called to disable the raw mode
  return () => {
    process.removeListener('exit', trap)
    disable()
  }
}

/* vim: set expandtab: */
/* vim: set filetype=javascript ts=2 shiftwidth=2: */
