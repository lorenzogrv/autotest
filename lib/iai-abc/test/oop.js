var test = require('tape')
var oop = require('iai-oop')
var iai = require('..')

test('oop namespace', function (t) {
  t.plan(3)

  t.deepEqual(iai.oop, oop, 'should refer the iai-oop module')

  iai.oop = null
  t.deepEqual(iai.oop, oop, 'should be non-writable')

  delete iai.oop
  t.deepEqual(iai.oop, oop, 'should be non-configurable')
})
