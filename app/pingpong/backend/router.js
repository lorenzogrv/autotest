var iai = require('iai')
var log = iai.log

log.level = iai.Log.VERB

const Raw = iai.answer.Raw
const View = iai.answer.View

const path = iai.path(__dirname, '..')
var urls = {
  '/': Raw(path.to('www/index.html')),
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
  .forEach((file) => { urls[file.slice(5)] = Raw(path.to(file)) })


module.exports = iai.answer.Router(urls)
