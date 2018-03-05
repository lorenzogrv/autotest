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
  })
  .on('ws:message', function (ws, data) {
    // TODO here it's supossed to delegate logic somewhere
    ws.send('echo received message: ' + data)
    try {
      var event = JSON.parse(data)
      if (event.name) {
        this.emit(event.name, event.data)
      } else {
        throw iai.Error('no name field in received JSON message')
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        return log.warn('received non-JSON message "%s"', data)
      }
      log.error(err)
    }
  })
  .on('stdin:request', function (ws) {
    if (!kb) {
      log.info('Sending stdin to all clients...')
      service.broadcast({ name: 'stdin:begin' })
      kb = read()
        .on('readable', function read () {
          var data = this.read()
          if (data === null) return
          service.broadcast({ name: 'stdin', data: data.toString() })
        })
        .on('end', function () {
          log.info('Done sending stdin.')
          service.broadcast({ name: 'stdin:end' })
          kb = null
        })
    }
  })
  .on('ws:close', function (clients) {
    if (kb && !clients.size) kb.end()
  })
