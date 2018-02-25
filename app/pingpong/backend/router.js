var iai = require('iai')
var log = iai.log

log.level = iai.Log.VERB

// TODO this is the most simple posible view: serve a file "as-is"
var fs = require('fs')
var path = iai.path(__dirname, '..')
function Raw (file) {
  return (req, res) => fs.createReadStream(path.to(file)).pipe(res)
}

function View (req, res) {
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
    log.warn('AJAX REQUEST! %s', req.url)
    log.warn('accept is %s', req.headers.accept)
    res.write(JSON.stringify({
      html: { 'after': '<h1 id="stdin"></h1>' },
      css: [],
      js: []
    }))
    return res.end()
  }
  log.warn('here it should load index.html, instert view contents on it, and pipe it to response')
  res.end()
}

var urls = {
  '/': Raw('www/index.html'),
  '/terminal': View
}

// automatically add handlers for assets
require('child_process')
  .spawnSync('find', ['./www', '-type', 'f'])
  .stdout.toString('utf8').split('\n')
  .filter((file) => file && !~file.indexOf('index.html'))
  .forEach(function (file) { urls[file.slice(5)] = Raw(file) })


module.exports = iai.Router(urls)
