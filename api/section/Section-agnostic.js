const { EventEmitter } = require('events')
const abc = require('iai-abc')
const oop = abc.oop
const log = abc.log

log.level = abc.Log.VERB

var Section = module.exports = new EventEmitter()

Section.create = function Section (id) {
  // TODO assert this context is either Section or inherits from it
  if (!id) {
    throw ReferenceError('views must have a valid Slug as id')
  }
  // TODO assert id is a valid "Slug"
  // this.cache stores "childs". Each section must have an unique id
  // within its parent section, even for top-level sections
  if (this.cache[id]) {
    return this.cache[id]
  }

  // this create procedure may lead to bugs, it's experimental
  var instance = Object.create(this)
  this.cache[id] = instance

  EventEmitter.call(instance) // initialize emitter or pray something
  instance.id = id // TODO this data descriptor should be non-writable
  // keep a reference to the section that created the instance
  instance.master = this
  // each instance has its own "child" cache
  instance.cache = Object.create(null) // TODO this should be a set?

  oop(instance)
    .accessor('id', () => this.id ? this.id + '-' + id : id)
    .accessor('url', () => (this.url || '') + '/' + id)

  log.info('created %s', instance)
  return instance
}

Section.cache = Object.create(null)

// fix instance instanceof Section
Section.constructor = Section.create
Section.constructor.prototype = Section

// same as Section.create, but returns the current context instead of the new Section
Section.add = function () {
  this.create.apply(this, arguments)
  return this
}

// provide a string representation of this view
Section.toString = function () {
  // TODO this.id may be undefined (SURE?->YES, for Section Prototype)
  return '[Section #' + this.id + ']'
  // TODO YAGNI toString('html') better => toHTML()
}

// research the urls aplicable to this section
Section.urls = function () {
  return [this.url].concat(Object.values(this.cache)
    .map((section) => section.urls())
    .reduce((a, b) => a.concat(b), [])
  )
}

// research the descendant sections for this section
Section.descendants = function () {
  return Object.values(this.cache)
    .map((section) => [section].concat(section.descendants()))
    .reduce((a, b) => a.concat(b), [])
}

// research an "url: view" map aplicable to this view
Section.urlmap = function () {
  var map = {}
  this.descendants().forEach(function (section) { map[section.url] = section })
  return map
}
