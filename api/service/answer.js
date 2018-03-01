const fs = require('fs')
const iai = require('iai-abc')
const log = iai.log

// EXPOSED OBJ
var answer = module.exports = {}

// this is the simplest possible answer: serve a file "as-is"
answer.Raw = function (file) {
  return (req, res) => fs.createReadStream(file).pipe(res)
}

// TODO i.e. convert a markdown document to html
answer.Document = function (file) {
  throw new Error('not implemented')
  // something like Raw, piping through transforms
}

answer.View = function (view) {
  return function (req, res) {
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      log.warn('AJAX REQUEST! %s', req.url)
      log.warn('accept is %s', req.headers.accept)
      // TODO this is actually a kind of answer.JSON
      res.write(JSON.stringify(view))
      return res.end()
    }
    log.warn('here it should load index.html, instert view contents on it, and pipe it to response')
    res.end()
  }
}

answer.Router = require('./Router')
