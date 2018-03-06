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
  [
    'circular-free',
    'circular-child',
    'circular-depth',
    'circular-complex',
    'circular-crazy'
  ].forEach(example => t.test(example, testExample('../example/' + example)))
  t.end() // so no
})
