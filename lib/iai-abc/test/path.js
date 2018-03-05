var test = require('tape')
var iai = require('..')

test('iai.path.to', function (t) {
  t.plan(1)
  t.equal(iai.path.to('test'), __dirname,
    'should resolve paths relative to the package dirname'
  )
})

test('iai.path().to', function (t) {
  t.plan(1)
  t.equal(iai.path('/').to('some', 'where', '..', 'where'), '/some/where',
    'should resolve paths relative to given dirname'
  )
})
