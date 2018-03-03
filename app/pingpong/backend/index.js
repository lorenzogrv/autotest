var iai = require('iai')
var log = iai.log
var read = iai.readkeys

log.level = iai.Log.VERB

var service = module.exports = iai.service

var kb = null

service
  .on('request', require('./router'))
  .on('ws:connection', function (ws) {
    ws.send('echo connected to websocket service!')
    if (!kb) {
      log.info('Sending stdin to all clients...')
      kb = read()
        .on('readable', function () {
          service.broadcast(iai.f('stdin %s', this.read()))
        })
        .once('end', function () {
          log.info('Done sending stdin.')
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
