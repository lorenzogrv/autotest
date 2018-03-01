var iai = require('iai-abc')
var log = iai.log

//log.level = iai.Log.INFO

module.exports = Router

function Router (uris) {
  // TODO convert uris to a suitable object (reusable regexps)
  return handle.bind(uris)
}

// There is NO next function here, this is not middleware
function handle (req, res) {
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
  res.writeHead(404, {
    'Connection': 'close',
    'Content-Type': 'text/plain'
  })
  res.end('url not found: ' + req.url)
}
