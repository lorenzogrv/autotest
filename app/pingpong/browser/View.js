const $ = require('jquery')

module.exports = View

View.prototype = View
View.prototype.constructor = View

function View (id) {
  if (!id) {
    throw new Error('views must have an id')
  }
  // YAGNI!!
  if (View.cache[id]) {
    return View.cache[id]
  }

  var instance = Object.create(View)
  View.cache[id] = instance

  instance.id = id // TODO this data descriptor should be non-writable

  return instance
}

View.cache = Object.create(null) // TODO this should be a set?

View.toString = function () {
  // TODO this.id may be undefined (SURE?)
  // TODO output string should be based on this.$
  return '<div id="' + this.id + '" class="view"></div>'
}

View.display = function () {
  if (this.$) {
    // TODO if i have a DOM element, it's already appended
    // HERE GOES "HIDE ALL VIEWS, SHOW THIS VIEW"
    alert('"navigate to" not implemented')
    return this
  }
  // no DOM element, let's append on body (with care)
  if (document.querySelector('#' + this.id) !== null) {
    alert('document id "' + this.id + '" already exists')
    throw new ReferenceError("can't duplicate id")
  }
  this.$ = document.createElement('div')
  this.$.id = this.id
  document.body.appendChild(this.$)
  var view = $(this.$).addClass('view loading')

  // TODO should return emitter instead?
  return $.get({url: this.id, dataType: 'json'})
    .fail(function (xhr, ts, error) {
      console.log(error)
      alert(error.message || error.stack || error)
    })
    .done(function (data) {
      if (typeof data.html === 'string') {
        data.html = { html: data.html }
      }
      if (data.html) {
        Object.keys(data.html)
          .filter((key) => /html|append|prepend|after|before/.test(key))
          .forEach((key) => view[key](data.html[key]))
      }
      var loading = []
      function loaded (url) {
        if (!loading.length) {
          alert('all resources loaded')
          return view.removeClass('loading')
        }
        loading.splice(loading.indexOf(url), 1)
        alert(url + 'loaded' + loading.length + 'resources left' + loading)
      }
      if (!(data.css && data.css.length) && !(data.js && data.js.length)) {
        return loaded()
      }
      if (data.css && data.css.length) {
        alert('now i will instert css')
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
        alert('now i will instert js')
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
