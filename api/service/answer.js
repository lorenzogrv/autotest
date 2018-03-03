const fs = require('fs')
const abc = require('iai-abc')
const log = abc.log

// log.level = abc.Log.INFO

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
    const tinit = Date.now()
    res.on('finish', function () {
      var code = res.statusCode
      var time = Date.now() - tinit
      log[code < 400 ? 'info' : code < 500 ? 'warn' : 'error'](
        '%s %s %sms', res.statusCode, req.url, Date.now() - tinit
      )
      if (time > 1000) {
        log.warn('it took %s seconds to handle %s', time / 1000, req.url)
      }
    })
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
