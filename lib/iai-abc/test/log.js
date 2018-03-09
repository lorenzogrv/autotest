var test = require('tape')
var Log = require('../lib/log')
var abc = require('..')

var levels = [ 'fatal', 'error', 'warn', 'info', 'verb' ]

// TODO as log becomes bigger, tests too. An independent package makes sense?

test('Log prototype', function (t) {
  t.equal(typeof Log.constructor, 'function', 'should provide a constructor')

  t.equal(Log.output, process.stderr, 'should default output to process.stderr')
  t.equal(Log.muted, false, 'should not be muted by default')
  Log.muted = true
  t.equal(Log.muted, true, 'should be muteable')
  Log.muted = false
  t.equal(Log.clean, false, 'should not be "clean" by default')
  // each log level must have its own method
  for (var name in levels) {
    name = levels[name]
    t.equal(typeof Log[name], 'function', 'should have function "' + name + '"')
    // each log level should have a "constant" value
    name = name.toUpperCase()
    t.notEqual(typeof Log[name], 'undefined', 'should define "' + name + '"')
  }
  // log level "constant" values should be semantic
  t.ok(Log.FATAL < Log.ERROR, 'level FATAL means less depth than ERROR')
  t.ok(Log.ERROR < Log.WARN, 'level ERROR means less depth than WARN')
  t.ok(Log.WARN < Log.INFO, 'level WARN means less depth that INFO')
  t.ok(Log.INFO < Log.VERB, 'level INFO means less depth than VERB')
  t.equal(Log.level, Log.WARN, 'main log default level should be WARN')
  t.end()
})

test('log instances', function (t) {
  var log = Log.constructor()
  t.ok(Log.isPrototypeOf(log), 'should inherit from Log prototype')
  t.ok(log instanceof Log.constructor, 'should be instanceof Log')

  t.equal(log.filename, __filename, 'should refer the filename that created it')
  t.equal(log.level, Log.WARN, 'default level to WARN')
  t.equal(log.muted, false, 'should be unmuted by default')

  // if Log prototype is configured as
  Log.muted = true
  log = Log.constructor()
  t.equal(log.muted, true, 'should be muted if Log prototype is muted')
  Log.muted = false

  t.end()
})

var PassThrough = require('stream').PassThrough
var exec = require('child_process').exec

test('log instances (output to stream)', function (t) {
  function testit (method, stream) {
    stream.write = t.pass.bind(t, 'Log.' + method + ' writes to the stream')
    Log[method]('some message')
  }
  var out = Log.output = new PassThrough()

  // 1 assertion for each log level except "fatal" (3 for that one)
  t.plan(4 + 3)

  Log.level = Log.VERB // set level to verbose to check all methods

  testit('verb', out)
  testit('info', out)
  testit('warn', out)
  testit('error', out)

  // restore Log output streams before test ends
  Log.output = process.stderr

  // custom code to check Log.fatal exits with proper code
  var code = 21
  var lines = [
    'var Log = require(\'' + abc.path.to('lib/log') + '\');',
    'Log.fatal(' + code + ', \'message here\');'
  ]
  // fatal behaviour should call process.exit so let's spawn a child process
  lines = 'node -e "' + lines.join(' ') + '"'
  exec(lines, function (err, stdout, stderr) {
    t.equal(err.code, code, 'exit code should match with the given one')
    t.equal(stdout, '', 'stdout should be empty')
    t.notEqual(stderr, '', 'stderr should not be empty')
    t.end()
  })
})

test('log instances (mute behaviour)', function (t) {
  var log = Log.constructor()
  log.output = new PassThrough()
  log.level = Log.VERB
  function testit (method) {
    log.muted = true
    log.output.write = () => t.fail('muted but got output with Log.' + method)
    log[method]('some message')
    log.muted = false
    log.output.write = () => t.pass('Log.' + method + ' writes to stream')
    log[method]('some message')
  }

  // 1 assertion for each log level except "fatal" (3 for that one)
  t.plan(4 + 3)
  testit('verb'); testit('info'); testit('warn'); testit('error')

  // restore Log output streams before test ends
  log.output = process.stderr

  // customized code to check Log.fatal exits with proper code
  var code = 35
  var lines = [
    'var Log = require(\'' + abc.path.to('lib/log') + '\');',
    'Log.muted = true;',
    'Log.fatal(' + code + ', \'message here\');'
  ]
  // fatal behaviour should call process.exit so let's spawn a child process
  lines = 'node -e "' + lines.join(' ') + '"'// console.log( lines );
  exec(lines, function (err, stdout, stderr) {
    t.equal(err.code, code, 'exit code should match with the given one')
    t.equal(stdout, '', 'stdout should be empty')
    t.equal(stderr, '', 'stderr should be empty')
    t.end() // not need as a plan is setup?
  })
})

test('log instances (log-level behaviour)', function (t) {
  // fake output stream
  var out = Log.output = new PassThrough()

  var when = function (LEVEL) {
    Log.level = Log[LEVEL]
    t.equal(Log.level, Log[LEVEL], 'Log level should be ' + LEVEL)
    var stream = null
    return {
      stream: function (o) { stream = o; return this },
      should: function (should, method) {
        // should=pass means it should write output
        // should=fail means it should not.
        stream.write = t[should].bind(t, method + ' wrote when level=' + LEVEL)
        Log[ method ]('some message')
        return this
      }
    }
  }
  // do not end test manually, use a plan.
  // 5 levels + each "pass" per level
  t.plan(5 + (4 + 3 + 2 + 1 + 0))

  // VERB level should output everything
  when('VERB')
    .stream(out).should('pass', 'verb').should('pass', 'info')
    .stream(out).should('pass', 'warn').should('pass', 'error')

  // INFO level should block output from verb level
  when('INFO')
    .stream(out).should('fail', 'verb').should('pass', 'info')
    .stream(out).should('pass', 'warn').should('pass', 'error')

  // WARN level should block output from verb and info levels
  when('WARN')
    .stream(out).should('fail', 'verb').should('fail', 'info')
    .stream(out).should('pass', 'warn').should('pass', 'error')

  // ERROR level should block output from warn, info and verb levels
  when('ERROR')
    .stream(out).should('fail', 'verb').should('fail', 'info')
    .stream(out).should('fail', 'warn').should('pass', 'error')

  // FATAL level should block output from ¿error?, warn, info, and verb
  when('FATAL')
    .stream(out).should('fail', 'verb').should('fail', 'info')
    .stream(out).should('fail', 'warn').should('fail', 'error')

  // restore Log output streams before test ends
  Log.stdout = process.stdout; Log.stderr = process.stderr

  // TODO FATAL method should exit process always

  // customized code to check Log.fatal exits with proper code
/*  var code = 35, lines = [
    'var Log = require(\''+ abc.path.to('lib/log') +'\');',
    'Log.fatal('+ code +', \'message here\');'
  ];
  // fatal behaviour should call process.exit so let's spawn a child process
  lines = 'node -e "'+ lines.join(' ') +'"'; abc.log.debug( lines );
  exec( lines, function( err, stdout, stderr ){
    t.equal( err.code, code, 'exit code should match with the given one');
    t.equal( stdout, '', 'stdout should be empty');
    t.equal( stderr, '', 'stderr should be empty');
  }); */
})

test('log instances (configurable default stream)', function (t) {
  var log = Log.constructor()

  // when Log's default streams are changed...
  var out = Log.output = new PassThrough()
  log = Log.constructor()
  t.deepEqual(log.output, out, 'default output should be the new default')

  // restore Log output stream
  Log.output = process.stderr
  t.end()
})

test('log constructor (cache control)', function (t) {
  // first thing needded is a way to access the log object from the cache
  t.equal(typeof Log.constructor.find, 'function', 'find should exist')
  Log.level = Log.ERROR
  var log = Log.constructor()
  Log.level = Log.WARN
  t.deepEqual(Log.constructor.find(/log.js$/), [log], 'find should work')
  // TODO this is BAD as unit test because it depends on lib/process.js
  var plog = Log.constructor.cache[ abc.path.to('lib/process.js') ]
  t.deepEqual(Log.constructor.find(/process.js$/), [plog], 'find process')
  // TODO test Log.constructor.findOne
  t.end()
})
