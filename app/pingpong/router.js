var fs = require('fs')
var iai = require('iai')
var log = iai.log

log.level = iai.Log.VERB

// TODO this is the most simple posible view: serve a file "as-is"
var path = iai.path(__dirname)
function Raw (file) {
  return (req, res) => fs.createReadStream(path.to(file)).pipe(res)
}

// TODO this should be an express.Router
// so it does not suck as now :D
module.exports = iai.Router({
  '/': Raw('index.html'),
  '/frontend.js': Raw('frontend.js'),
  '/css/normalize.css': Raw('css/normalize.css'),
  '/css/main.css': Raw('css/main.css'),
  '/site.webmanifest.json': Raw('site.webmanifest.json'),
  '/img/iai-icon.png': Raw('img/iai-icon.png')
})
