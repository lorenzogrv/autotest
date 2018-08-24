var iai = require('iai-api')
var log = iai.log

log.level = iai.Log.INFO

var service = module.exports = iai.service

// comment the line below to disable stdin-to-client pipe
var keyboard = iai.readkeys({ humanize: true })

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
    if (keyboard) {
      log.info('Sending stdin to all clients...')
      service.broadcast({ name: 'stdin:begin' })
      process.stdin
        .pipe(keyboard)
        .on('data', function read (data) {
          service.broadcast({ name: 'stdin', data: data.toString() })
        })
        .on('end', function () {
          log.info('Done sending stdin.')
          process.stdin.pause()
          service.broadcast({ name: 'stdin:end' })
        })
    } else {
      return service.broadcast('not available now')
    }
  })
  .on('ws:close', function (clients) {
    if (clients.size) return
    process.stdin.unpipe(keyboard)
  })
  .on('close', () => process.stdin.pause())

if (require.main === module) {
  log.info('starting backend service...')
  service
    // /* comment/uncomment this line to toggle iai.proc SIGINT hadling
    .on('listening', () => {
      log.info('SIGINT is expected to be handled gracefully by iai.service')
      iai.proc.ignoreSIGINT()
    }) // */
    .listen(27780)
}
