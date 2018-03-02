const iai = require('iai')
const log = iai.log

log.level = iai.Log.VERB

const Raw = iai.answer.Raw
const File = iai.answer.File

function View (view) {
  return function (req, res) {
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      log.warn('AJAX REQUEST! %s', req.url)
      log.warn('accept is %s', req.headers.accept)
      // TODO this is actually a kind of answer.JSON, nothing to do with view
      res.write(JSON.stringify(view))
      return res.end()
    }
    log.warn('NOn-AJAX REQUEST! %s', req.url)
    var parts = req.url.split('/').slice(1)
    var cumbs = []
    var v = iai.View
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
      cumbs.shift().insert($)
    }
    res.write($.html())
    res.end()
  }
}


const path = iai.path(__dirname, '..')
const fs = require('fs')
const index = fs.readFileSync(path.to('www/index.html'), 'utf8')
const cheerio = require('cheerio')
var urls = {
  '/': File(path.to('www/index.html')),
  '/terminal': View({
    html: { 'after': '<h1 id="stdin"></h1>' },
    css: [],
    js: []
  })
}

// automatically add handlers for assets
require('child_process')
  .spawnSync('find', ['./www', '-type', 'f'])
  .stdout.toString('utf8').split('\n')
  .filter((file) => file && !~file.indexOf('index.html'))
  .forEach((file) => { urls[file.slice(5)] = File(path.to(file)) })


module.exports = iai.answer.Router(urls)
