const test = require('tape')

const sources = require('../lib/tool/sources')

function testExample (reference) {
  // populate require.cache with module
  require(reference)
  const mod = require.cache[require.resolve(reference)]
  return function (t) {
    t.plan(1)
    var result = sources(mod)
    t.equal(result.length, 4, 'should detect 4 files for ' + reference)
  }
}

test('tool/sources examples', function (t) {
  t.plan(4)
  t.test('circular free', testExample('../example/circular-free'))
  t.test('circular child', testExample('../example/circular-child'))
  t.test('circular depth', testExample('../example/circular-depth'))
  t.test('circular complex', testExample('../example/circular-complex'))
})
