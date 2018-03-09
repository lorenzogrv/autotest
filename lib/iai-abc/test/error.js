var test = require('tape')

var error = require('../lib/error')
var CustomError = error.CustomError

test('CustomError', function (t) {
  t.ok(CustomError, 'should be provided')
  if (typeof CustomError.constructor === 'function') {
    t.pass('has a constructor function')
  } else {
    t.fail('should have a constructor function')
  }
  t.end()
})

test('CustomError instances', function (t) {
  var err = CustomError.constructor('error message')

  t.plan(3)

  t.ok(err instanceof Error, 'should be intanceof Error')
  t.ok(err instanceof CustomError.constructor,
    'should be instanceof its constructor')

  t.equal(err.name, 'CustomError', 'name should be "CustomError"')
})

test.skip('ErrorList')
