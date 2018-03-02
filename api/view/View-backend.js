const { EventEmitter } = require('events')
const { format } = require('util')
//const iai = require('iai-abc')
//const log = iai.log

var View = module.exports = new EventEmitter()

View.create = function View (id) {
  // TODO assert this context is either View or inherits view
  if (!id) {
    throw new Error('views must have an id')
  }
  // YAGNI!! TODO this.cache stores "childs"
  if (this.cache[id]) {
    return this.cache[id]
  }

  // this create procedure may lead to bugs, it's experimental
  var instance = Object.create(this)
  this.cache[id] = instance

  EventEmitter.call(instance) // initialize emitter or pray something
  instance.id = id // TODO this data descriptor should be non-writable
  // TODO YAGNI not all views will be "root" views? SURE?
  //instance.cache = Object.create(null) // TODO this should be a set?

  return instance
}

View.cache = Object.create(null) // TODO this should be a set?

View.toString = function () {
  // TODO this.id may be undefined (SURE?)
  // TODO output string should be based on this.$
  return '[View #' + this.id + ']'
  // return '<div id="' + this.id + '" class="view"></div>'
}

View.insert = function ($) { 
  if ($('#' + this.id).length) {
    throw new ReferenceError("can't duplicate id " + this.id)
  } else {
    console.dir($('#'+this.id).length)
  }
}

View.display = function () {
  if (this.$) {
    // TODO if i have a DOM element, it's already appended
    // HERE GOES "HIDE ALL VIEWS, SHOW THIS VIEW"
    alert('"navigate to" not implemented')
    return this
  }
  this.$ = document.createElement('div')
  this.$.id = this.id
  document.body.appendChild(this.$)
  $(this.$).addClass('view loading')

  var view = this
  return $.get({url: this.id, dataType: 'json'})
    .fail(function (xhr, ts, error) {
      console.log(error)
      log(error.message || error.stack || error)
    })
    .done(function (data) {
      if (typeof data.html === 'string') {
        data.html = { html: data.html }
      }
      if (data.html) {
        Object.keys(data.html)
          .filter((key) => /html|append|prepend|after|before/.test(key))
          .forEach((key) => $(view.$)[key](data.html[key]))
      }
      var loading = []
      function loaded (url) {
        if (!loading.length) {
          log('all resources loaded')
          return $(view.$).removeClass('loading')
        }
        loading.splice(loading.indexOf(url), 1)
        log(url + 'loaded' + loading.length + 'resources left' + loading)
      }
      if (!(data.css && data.css.length) && !(data.js && data.js.length)) {
        return loaded()
      }
      if (data.css && data.css.length) {
        log('insterting %s css stylesheets...', data.css.length)
        data.css
          // avoid duplicating existing stylesheets
          .filter((url) => !$('link[href="' + url + '"]').length)
          .map(function (url) {
            loading.push(url)
            var l = document.createElement('link')
            l.rel = 'stylesheet'
            l.href = url
            l.onload = loaded.bind(view, url)
            return l
          })
          .foreach((link) => document.head.appendChild(link))
      }
      if (data.js && data.js.length) {
        log('insterting %s js scripts...', data.js.length)
        data.js
          // avoid duplicating existing scripts
          .filter((url) => !$('script[src="' + url + '"]').length)
          .map(function (url) {
            loading.push(url)
            var s = document.createElement('script')
            s.src = url
            s.onload = loaded.bind(view, url)
            return s
          })
          .foreach((script) => document.body.appendChild(script))
      }
    })
}
