var iai = require('iai-api')
var log = iai.log

log.level = iai.Log.VERB

var service = module.exports = iai.service

service
  .on('request', require('./router'))
  .on('ws:connection', function (ws) {
    ws.send('echo connected to websocket service!')
  })
  // This is a kind of websocket JSON message api
  .on('ws:connection', function (ws) {
    var originalSend = ws.send.bind(ws)
    ws.send = (data, options, callback) => {
      if (typeof data !== 'string') data = JSON.stringify(data)
      return originalSend(data, options, callback)
    }
  })
  // This is a kind of websocket message-as-event api
  .on('ws:message', function (ws, data) {
    ws.send('echo received message: ' + data)
    try {
      var event = JSON.parse(data)
      log.verb('client event: %j', event)
      if (event.name) {
        this.emit(event.name, ws, event.data)
        ws.emit(event.name, event.data)
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

if (require.main === module) {
  // below is the bootstrap implementation of stdin-to-client pipes
  var keyboard = iai.readkeys({ humanize: true })
  var keypipes = [] // TODO this should be a set
  var key_init = (ws) => {
    // ignore multiple init request from same client
    if (~keypipes.indexOf(ws)) return false

    log.info('Sending stdin to client %s...', service.websocketId(ws))
    ws.send({ name: 'stdin:begin' })

    keypipes.push(ws)
    if (keypipes.length > 1) return false
    // for the first client requesting capure, the following runs

    service.on('ws:close', function wsClose (ws) {
      // ignore websockets not being in keypipes
      if (!~keypipes.indexOf(ws)) return false
      keypipes.splice(keypipes.indexOf(ws), 1)
      if (keypipes.length) return false
      service.removeListener('ws:close', wsClose)
      key_done()
    })

    log.warn('Awaiting for keyboard focus lost...')
    keyboard.once('focuslost', key_stop)
  }
  var key_send = data => {
    log.verb('key send %s to %s clients', data.toString(), keypipes.length)
    keypipes.map(ws => ws.send({ name: 'stdin', data: data.toString() }))
  }
  var key_stop = () => {
    keypipes.map(ws => ws.send({ name: 'stdin:end' }))
    keypipes = []
    key_done()
  }
  var key_done = () => {
    keyboard.removeListener('focuslost', key_stop)
    log.warn('Keyboard unfocused. Press Ctrl+C to exit')
  }

  // this code bounds the keyboard capture
  if (true) {
    log.info('plugin keyboard pipe')
    service.on('stdin:request', key_init)
    process.stdin
      .pipe(keyboard)
      // keep consuming data even if there is nobody connected
      .on('data', key_send)
      // close service when keyboard stream ends
      .on('end', () => service.close())
  }

  log.info('starting backend service...')
  service
    // /* comment/uncomment this line to toggle iai.proc SIGINT hadling
    .on('listening', () => {
      log.info('SIGINT is expected to be handled gracefully by iai.service')
      iai.proc.ignoreSIGINT()
    }) // */
    .once('close', () => {
      log.info('closed backend service.')
    })
    .listen(27780)
}

/* vim: set expandtab: */
/* vim: set filetype=javascript ts=2 shiftwidth=2: */
