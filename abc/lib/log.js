const { PassThrough } = require('stream')

var relative = require('path').relative
var format = require('util').format

var oop = require('iai-oop')
var ansi = require('iai-ansi')
var callsite = require('./tool/callsite')

// EXPOSED OBJECT
var exports = module.exports = {}
exports.constructor = Log
exports.constructor.prototype = exports

/**
 * @function Log: returns a log api bound to the file where it was created
 * @param from: provide a function to research a previous CallSite
 * @returns Log object
 */
function Log (from) {
  from = callsite(typeof from === 'function' ? from : Log)

  var instance = oop.create(this)
    // filename and line number where log instance is created
    .visible('filename', from.getFileName())
    .visible('line', from.getLineNumber())
    // configurable flags
    .flag('muted', false)
    .flag('clean', false)
    .internal('level', exports.WARN)
    // TODO option to redirect output stream without overriding default
    // above is no-sense because idea is to keep all logs output to ONE stream
    // Log should write everything to stderr, any level
    .internal('output', this.output)
    .o

  // Use Log "depth" control to enable this message (Log.level=Log.VERB)
  exports.verb('created log from %s:%d', instance.filename, instance.line)

  if (Log.cache[ instance.filename ]) {
    exports
      .warn('Cache hit for `%s`!', instance.filename)
      .warn('At line %d', instance.line)
      // .warn('That file has two or more calls to `Log.constructor`.')
      // .warn('`callsite` is fetched on each call, so wasting resources.')
      .warn('The cached Log object is going to be overriden.')

    // NEVER return the cached object. Doing so messes-up unit tests
  }
  Log.cache[ instance.filename ] = instance
  return instance
}

oop(exports)
  // filename for 'Master' log instance (this file)
  .internal('filename', __filename)
  // default output stream (fallback to PassThrough for browser)
  .internal('output', process.stderr || new PassThrough())
  /**
   * Configurable flags
   *
   *   - muted: mutes ALL output messages (also those of `error` and `warn`).
   *           `fatal` will still exit process, but will output nothing too.
   *   - clean: whenever to omit prepending `this.toString() + ' '` to messages.
   */
  .flag('muted', false)
  .flag('clean', false) // TODO clean seems useless at the moment
  // "constants" defining log levels
  .visible('FATAL', 0)
  .visible('ERROR', 1)
  .visible('WARN', 2)
  .visible('INFO', 3)
  .visible('VERB', 4)
  // default log level for the main logger (exported prototype)
  .internal('level', exports.WARN)

/**
 * To allow programatically reaching log instances from other modules and
 * warning about abuse of Log.constructor, Log instances are cached.
 */

Log.cache = Object.create(null)

Log.find = function (re) {
  return Object.keys(Log.cache)
    .filter(re.test, re)
    .map(function (filename) { return Log.cache[filename] })
}

Log.findOne = function (re) {
  var result = this.find(re)
  if (result.length > 1) throw new Error('expecting 1 match and no more')
  if (result.length < 1) throw new Error('expecting 1 match at least')
  return result[0]
}

// provide a string representation of this object
exports.toString = function () {
  return '[' +
    relative(process.cwd(), this.filename) +
    '@' + process.pid +
    ']'
}

// outputs a report as string (meant for internal use)
// report is an 'arguments' object suitable to be apply'd to util.format
exports.msg = function (report, options) {
  if (this.muted || options.level > this.level) return this

  // TODO multi-line input given an array
  // remember report is an `arguments` object
  // if( report.length == 1 ) report = report[0];
  // report = Array.isArray(report)? report.map( format ) : report;

  var color = options.color
  var msg = ''
  msg += ((color ? ansi.reset || '' : ''))
  msg += ((this.clean ? '' : (this + ' ')))
  // TODO think if another option for "not prepending"
  msg += ((this.clean ? '' : (options.prepend || '')))
  msg += ((color ? ansi[color] || '' : ''))
  // TODO decide if join without "this+' '" - use Array(msg.length).join(' ')
  msg += ((format.apply(0, report).split('\n').join('\n' + msg)))
  msg += ((color ? ansi.reset || '' : ''))

  this.output.write(msg + '\n')
  return this
}

//
// Log-level accesors
//
exports.fatal = function (code) {
  var hasCode = (typeof code === 'number')
  this.error('FATAL ERROR%s!', hasCode ? (' with exit code ' + code) : '')
  this.msg(hasCode ? [].slice.call(arguments, 1) : arguments, {
    color: 'red', prepend: 'EE ', level: exports.FATAL
  })
  process.exit(hasCode ? code : 1)
}
exports.error = function () {
  return this.msg(arguments, {
    color: 'red', prepend: 'EE ', level: exports.ERROR
  })
}
exports.warn = function () {
  return this.msg(arguments, {
    color: 'yellow', prepend: 'WW ', level: exports.WARN
  })
}
exports.info = function () {
  return this.msg(arguments, {
    color: 'blue', prepend: 'II ', level: exports.INFO
  })
}
exports.verb = exports.debug = function () {
  return this.msg(arguments, { prepend: 'VV ', level: exports.VERB })
}
// TODO decide if debug messages do not prepend "VV"
