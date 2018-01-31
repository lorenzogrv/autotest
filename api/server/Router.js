var iai = require('iai-abc')
var log = iai.log

log.level = iai.Log.VERB

module.exports = Router

function handle (req, res, next) {
  log.verb('request %s', req.url)

  if (typeof this[req.url] === 'function') {
    log.info('URI %s', req.url)
    return this[req.url](req, res)
  }
  // TODO foreach this[req.url] there may be regexps (string starts with ^)
  if (typeof next === 'function') {
    return next()
  }
  log.warn('404 %s', req.url)
  res.writeHead(404, {
    'Connection': 'close',
    'Content-Type': 'text/plain'
  })
  res.end('url not found: ' + req.url)
}

function Router (uris) {
  return handle.bind(uris)
}
