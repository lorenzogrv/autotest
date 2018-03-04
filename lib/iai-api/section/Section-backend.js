const Parent = require('./Section-agnostic')

const abc = require('iai-abc')
const log = abc.log

log.level = abc.Log.VERB

var View = module.exports = Object.create(Parent)

// insert this view into HTML document accesible through jquery/cheerio api '$'
View.inlay = function ($) {
  if ($('#' + this.id).length) {
    throw ReferenceError("can't duplicate id " + this.id)
  }
  this.$ = $('<section></section>')
  this.id && this.$.attr('id', this.id) // this.id may be undefined for root section
  this.$
    .addClass('view loading')
    // TODO it may have to be appended on master view <section>
    .appendTo('div[role=main]')
  return this.render(
    this.data && this.data.html ? this.data.html : this.toString()
  )
  // TODO assets? => NOT HERE
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
        var allow = /html|append|prepend|after|before/
        Object.keys(data.html)
          .filter(allow.test.bind(allow))
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
