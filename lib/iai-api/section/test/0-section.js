var test = require('tape')

var Section = require('..')

test('exposed prototype', function (t) {
  t.plan(3)
  t.equal(typeof Section, 'object', 'should be provided')
  t.equal(typeof Section.constructor, 'function', 'should have a constructor')
  t.equal(typeof Section.create, 'function', 'should have a builder')
})

test('instances', function (t) {
  t.plan(4)
  var section
  t.throws(() => Section.create(), 'need at least an id to be created')
  t.doesNotThrow(function () {
    section = Section.create('any-string-as-id')
  }, 'can be created with only a string id')
  t.ok(section instanceof Section.constructor, 'should be instanceof Section')
  t.ok(Section.isPrototypeOf(section), 'should inherit from Section prototype')
})

test('EventEmitter instances', function (t) {
  const { EventEmitter } = require('events')
  t.plan(1)
  t.notok(
    (new EventEmitter()) instanceof Section.constructor,
    'should not be instanceof Section'
  )
})

test('instance#id', function (t) {
  t.plan(3)
  var foo = Section.create('foo')
  t.equal(foo.id, 'foo', 'should be the section slug')
  var bar = foo.create('bar')
  t.equal(bar.id, 'foo-bar', 'should prepend the master section id')
  var baz = bar.create('baz')
  t.equal(baz.id, 'foo-bar-baz', 'should prepend each master section id')
})

test('instance#url', function (t) {
  t.plan(3)
  var foo = Section.create('foo')
  t.equal(foo.url, '/foo', 'should be the section slug preceded by a slash')
  var bar = foo.create('bar')
  t.equal(bar.url, '/foo/bar', 'should prepend the master section url')
  var baz = bar.create('baz')
  t.equal(baz.url, '/foo/bar/baz', 'should prepend each master section url')
})
