var iai = require('iai')
var log = iai.log

log.level = iai.Log.VERB

// TODO this is the most simple posible view: serve a file "as-is"
var fs = require('fs')
var path = iai.path(__dirname, '..')
function Raw (file) {
  return (req, res) => fs.createReadStream(path.to(file)).pipe(res)
}

var urls = {
  '/': Raw('www/index.html')
}

// automatically add handlers for assets
require('child_process')
  .spawnSync('find', ['./www', '-type', 'f'])
  .stdout.toString('utf8').split('\n')
  .filter((file) => file && !~file.indexOf('index.html'))
  .forEach(function (file) { urls[file.slice(5)] = Raw(file) })
console.log(urls)
module.exports = iai.Router(urls)
