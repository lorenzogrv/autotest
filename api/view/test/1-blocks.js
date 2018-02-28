var test = require('tape')
var iai = require('iai-abc')

var View = require('..')
var fixture = require('fs').readFileSync(__dirname + '/fruits.html', 'utf8')

test('view#define', function (t) {
  var view = View.constructor(fixture)
  t.equal(typeof view.define, 'function', 'should be a function')

  view.define('list', '#fruits')
  t.equal(typeof view.block.list, 'object', 'should define a block')

  view.define('first', '.apple')
  t.equal(typeof view.block.first, 'object', 'each time it is called')

  t.doesNotThrow(function () {
    view.define('list', '#fruits .pear')
  }, 're-defining a block is ok')

  view.define('list', null)
  t.equal(typeof view.block.list, 'undefined',
    're-define a block as null to delete it')

  t.throws(function () {
    view.define('thing', '#unexistant-id')
  }, iai.Error, 'should throw when selector matches nothing')

  t.throws(function () {
    view.define('thing', 'li')
  }, iai.Error, 'should throw when selector matches more than 1 DOM node')

  t.end()
})
