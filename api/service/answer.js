const fs = require('fs')
const abc = require('iai-abc')
const log = abc.log

log.level = abc.Log.VERB

// EXPOSED OBJ
var answer = module.exports = {}

// There is NO next function here as answers ARE NOT middleware

// creates a request handler to route requests based on url
answer.Router = function (urimap) {
  const uris = urimap
  // TODO in uris there may be regexps (string starts with ^)
  // TODO convert uris to a suitable object (reusable regexps)
  const NotFound = answer.NotFound()
  return function handle (req, res) {
    if (typeof uris[req.url] === 'function') {
      return uris[req.url](req, res)
    }
    return NotFound(req, res)
  }
}

// creates a request handler to answer a 404 Not Found response
answer.NotFound = function (opts) {
  // TODO opts?
  return function (req, res) {
    res.writeHead(404, {
      'Connection': 'close',
      'Content-Type': 'text/plain'
    })
    res.end('url not found: ' + req.url)
  }
}

// creates a request handler to serve file "as-is"
answer.File = function (file) {
  return (req, res) => fs.createReadStream(file).pipe(res)
}

// creates a request handler to write given data "as-is"
answer.Raw = function (data) {
  return (req, res) => res.write(data) + res.end()
}

// TODO i.e. convert a markdown document to html
answer.Document = function (file) {
  throw new Error('not implemented')
  // something like Raw, piping through transforms
}
