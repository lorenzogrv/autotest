var iai = require('iai-abc')
var log = iai.log

log.level = iai.Log.WARN

module.exports = Router

function handle (req, res, next) {
  res.on('finish', function () {
    var code = res.statusCode
    log[code < 400 ? 'info' : code < 500 ? 'warn' : 'error'](
      '%s %s', res.statusCode, req.url
    )
  })

  if (typeof this[req.url] === 'function') {
    return this[req.url](req, res)
  }

  // TODO foreach this[req.url] there may be regexps (string starts with ^)
  if (typeof next === 'function') {
    return next() // YAGNI?
  }
  res.writeHead(404, {
    'Connection': 'close',
    'Content-Type': 'text/plain'
  })
  res.end('url not found: ' + req.url)
}

function Router (uris) {
  return handle.bind(uris)
}
