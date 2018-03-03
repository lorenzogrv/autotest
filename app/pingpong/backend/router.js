const iai = require('iai')
const log = iai.log

log.level = iai.Log.VERB

const File = iai.answer.File

const RootView = iai.View

function View (view) {
  return function (req, res) {
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      log.warn('AJAX REQUEST! %s', req.url)
      log.warn('accept is %s', req.headers.accept)
      // TODO this is actually a kind of answer.JSON, nothing to do with view
      res.write(JSON.stringify(view))
      return res.end()
    }
    log.warn('NON-AJAX REQUEST! %s', req.url)
    var parts = req.url.split('/').slice(1)
    var cumbs = []
    var v = RootView
    while (parts.length) {
      v = v.create(parts.shift())
      cumbs.push(v)
      continue
      // TODO this should be pushed instead
      cumbs.push({
        ref: null, // the parts.shift() thing
        url: cumbs[cumbs.length - 1].url + '/' + 'name', // or "/"
        obj: view
      })
    }
    log.warn('here it should insert view on index and pipe it to response')
    var $ = cheerio.load(index)
    while (cumbs.length) {
      cumbs.shift().inlay($)
    }
    res.write($.html())
    res.end()
  }
}

const path = iai.path(__dirname, '..')
const fs = require('fs')
const index = fs.readFileSync(path.to('www/index.html'), 'utf8')
const cheerio = require('cheerio')

const Section = iai.Section

var home = Section.create('home')
  .create('section-one')
  .add('section-one-one')
  .add('section-one-two')
  .master
  .add('section-two')
  .create('section-three')
  .add('section-three-one')
  .add('section-three-two')
  .master
  .add('section-four')

console.log(home.urls())

var urls = {
  '/terminal': View({
    html: { 'after': '<h1 id="stdin"></h1>' },
    css: [],
    js: []
  }),
  '/urls': View({
    html: () => iai.f('%o', home.urls())
  })
}

module.exports = iai.answer.Router({
  urls: urls,
  www: path.to('www')
})
