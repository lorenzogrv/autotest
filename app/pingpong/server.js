var iai = require('iai')
var log = iai.log
var read = iai.readkeys

log.level = iai.Log.VERB

var server = module.exports = Object.create(iai.Server)

var kb = null

server
  .on('request', require('./router'))
  .on('ws:connection', function (ws) {
    ws.send('echo connected to server!')
    if (!kb) {
      log.info('reading from stdin...')
      kb = read()
      .on('readable', function () {
        server.broadcast(iai.f('stdin %s', this.read()))
      })
      .once('end', function () {
        log.info('Done reading stdin.')
        kb = null
      })
    }
  })
  .on('ws:message', function (ws, data) {
    // TODO here it's supossed to delegate logic somewhere
    log.warn('received message "%s"', data)
    ws.send('echo received message: ' + data)
  })
  .on('ws:close', function (clients) {
    if (kb && !clients.size) kb.end()
  })
