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
    .visible('filename', from.getFileName())
    .visible('line', from.getLineNumber())
    .flag('muted', false)
    .flag('clean', false)
    .internal('level', exports.WARN)
    // TODO option to redirect stdout and stderr without overriding defaults
    .internal('stdout', this.stdout)
    .internal('stderr', this.stderr)
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
  // default output streams
  .internal('stdout', process.stdout)
  .internal('stderr', process.stderr)
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
    relative(process.cwd(), this.filename || __filename) +
    '@' + process.pid +
    ']'
}

// output functions (for internal use)

// outputs a report as string
exports.msg = function (report, options) {
  if (this.muted || options.level > this.level) return this

  // TODO multi-line input given an array
  // remember report is an `arguments` object
  // if( report.length == 1 ) report = report[0];
  // report = Array.isArray(report)? report.map( format ) : report;

  var color = options.color
  var msg = ''
  msg += ((color ? ansi.reset : ''))
  msg += ((this.clean ? '' : (this + ' ')))
  // TODO think if another option for "not prepending"
  msg += ((this.clean ? '' : (options.prepend || '')))
  msg += ((color ? ansi[color] : ''))
  // TODO decide if join without "this+' '" - use Array(msg.length).join(' ')
  msg += ((format.apply(0, report).split('\n').join('\n' + msg)))
  msg += ((color ? ansi.reset : ''))

  options.stream.write(msg + '\n')
  return this
}
exports.out = function (report, opts) {
  opts.stream = this.stdout
  return this.msg(report, opts)
}
exports.err = function (report, opts) {
  opts.stream = this.stderr
  return this.msg(report, opts)
}

//
// Log-level accesors
//
exports.fatal = function (code) {
  var hasCode = (typeof code === 'number')
  this.error('FATAL ERROR%s!', hasCode ? (' with exit code ' + code) : '')
  this.err(hasCode ? [].slice.call(arguments, 1) : arguments, {
    color: 'red', prepend: 'EE ', level: exports.FATAL
  })
  process.exit(hasCode ? code : 1)
}
exports.error = function () {
  return this.err(arguments, {
    color: 'red', prepend: 'EE ', level: exports.ERROR
  })
}
exports.warn = function () {
  return this.err(arguments, {
    color: 'yellow', prepend: 'WW ', level: exports.WARN
  })
}
exports.info = function () {
  return this.out(arguments, {
    color: 'blue', prepend: 'II ', level: exports.INFO
  })
}
exports.verb = exports.debug = function () {
  return this.out(arguments, { prepend: 'VV ', level: exports.VERB })
}
// TODO decide if verbose messages do not prepend "DEBUG"
