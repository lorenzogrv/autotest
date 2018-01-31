var fs = require('fs')
var iai = require('iai')
var log = iai.log

log.level = iai.Log.VERB

var path = iai.path(__dirname)

// TODO this should be an express.Router
// so it does not suck as now :D
module.exports = iai.Router({
  '/': (req, res) => fs.createReadStream(path.to('index.html')).pipe(res),
  '/frontend.js': (req, res) => fs.createReadStream(path.to('frontend.js')).pipe(res)
})
