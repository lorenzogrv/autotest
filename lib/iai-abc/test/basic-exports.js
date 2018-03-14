var test = require('tape')

var abc = require('..')

// TODO it's not clear now it it must be as lighweigth as 2 files
test.skip('dependencies', function (t) {
  // do not access through abc.tool so it gets not injected as child
  var sources = require('../lib/tool/sources')
  var mod = require.cache[ require.resolve('..') ]
  // oop is used to define exports so it can't be lazy-loaded
  t.equal(sources(mod).length, 2, 'everything must be lazy except "iai-oop"')
  t.end()
})

test('#oop', function (t) {
  var oop = require('iai-oop')
  t.deepEqual(abc.oop, oop, 'should refer the iai-oop module')
  abc.oop = null
  t.deepEqual(abc.oop, oop, 'should be non-writable')
  delete abc.oop
  t.deepEqual(abc.oop, oop, 'should be non-configurable')
  t.end()
})

test.skip('#is', function (t) {
  var is = require('iai-is')
  t.deepEqual(abc.is, is, 'should refer the iai-is module')
  abc.is = null
  t.deepEqual(abc.is, is, 'should be non-writable')
  delete abc.is
  t.deepEqual(abc.is, is, 'should be non-configurable')
  t.end()
})

test('#Error', function (t) {
  t.equal(typeof abc.Error, 'function', 'should be a function')
  t.ok(abc.Error() instanceof Error, 'should return instances of Error')
  t.ok(abc.Error() instanceof abc.Error, 'should return instances of itself')
  t.equal(
    abc.Error('str %s %d %j', 'replace', 27, {}).message,
    'str replace 27 {}',
    'should provide util.format feature set'
  )
  t.end()
})

test('#Log', function (t) {
  t.equal(typeof abc.Log, 'object', 'should be an object')
  t.deepEqual(abc.Log, require('../lib/log'), 'should be the log prototype')
  t.end()
})

test('#log', function (t) {
  abc.Log.muted = true
  var log = abc.log
  t.equal(log.filename, __filename,
    'should return a log instance bound to the caller file')
  t.equal(log.muted, true, 'should be muted if Log prototype is muted')
  abc.Log.muted = false
  t.end()
})
