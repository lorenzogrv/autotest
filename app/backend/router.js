const iai = require('iai-api')
const log = iai.log

log.level = iai.Log.VERB

const path = iai.path(__dirname, '..')
const content = require('../content')

var urls = {
  '/unexistant-url': iai.answer.NotFound(),
  '/urls': iai.answer.NotFound()
}

//
// UI DOM-related things
//
const ui = iai.ui.create(path.to('www/index.html'))

// this is the basic render: append section to $ if not present
ui.on('render', function ($, section) {
  var body = $('body')
  // var header = body.find('header')
  var master = body.find('div[role=main]')
  var content = master.find('#' + section.id)
  if (!content.length) {
    log.verb('rendering %s...', section.id)
    // TODO it may have to be appended on master view <section>
    content = $('<section></section>')
      .addClass('loading selected')
      .attr('id', section.id)
    if (section.data.html) {
      var htmldata = section.data.html
      if (typeof htmldata === 'string') {
        htmldata = { html: htmldata }
      }
      Object.keys(htmldata)
        .filter(key => /html|append|prepend|after|before/.test(key))
        // YAGNI data.html strings may be dinamically generated?
        // .map(key => data.html[key].toString())
        .forEach((key) => content[key](htmldata[key]))
    }
    content.appendTo(master)
  }
  // var sections = master.find('section')
})

// next step on rendering implies setting up references to external assets
// TODO this should be the diference between backend and browser (onload detect)
ui.on('render', function ($, section) {
  log.info('rendering section %s', section)
  const css = section.data.css
  if (css && css.length) {
    log.info('insterting %s css stylesheets...', css.length)
    $('head').append(css
      // avoid duplicating existing stylesheets
      .filter((url) => !$('link[href="' + url + '"]').length)
      .map((url) => $('<link>').attr({
        rel: 'stylesheet',
        href: url
      }))
      .reduce((a, b) => a + b)
    )
  }
  const js = section.data.js
  if (js && js.length) {
    log.info('insterting %s js scripts...', js.length)
    $('body').append(js
      // avoid duplicating existing scripts
      .filter((url) => !$('script[src="' + url + '"]').length)
      .map((url) => $('<script></script>').attr('src', url))
      .reduce((a, b) => a + b)
    )
  }
})
module.exports = iai.answer.Router({
  urls: urls,
  menu: content,
  ui: ui,
  www: path.to('www')
})
