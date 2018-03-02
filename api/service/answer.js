const fs = require('fs')
const iai = require('iai-abc')
const log = iai.log

// EXPOSED OBJ
var answer = module.exports = {}

// this is the simplest possible answer: serve a file "as-is"
answer.File = function (file) {
  return (req, res) => fs.createReadStream(file).pipe(res)
}

// another simple answer example: write given data "as-is"
answer.Raw = function (data) {
  return (req, res) => res.write(data) + res.end()
}

// TODO i.e. convert a markdown document to html
answer.Document = function (file) {
  throw new Error('not implemented')
  // something like Raw, piping through transforms
}

answer.Router = require('./Router')
