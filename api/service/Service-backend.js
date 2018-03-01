var os = require('os')
var http = require('http')
var WebSocketServer = require('ws').Server

var iai = require('iai-abc')
var log = iai.log
log.level = iai.Log.INFO

var server = http.createServer()

server.on('listening', function () {
  var url = 'http://' + os.hostname() + ':' + this.address().port
  log.info('server listening @ %s', url)
})

var exports = module.exports = server

var listen = exports.listen
exports.listen = function () {
  if (this === exports) {
    throw iai.Error('#listen only available for objects inheriting server')
  }
  return listen.apply(this, arguments)
}

// Web Socket Integration
// Never implement here details of what to do with messages
// Nor send messages from here!!
var wss = new WebSocketServer({ server: server })
wss.on('connection', function (ws) {
  log.info('ws client connected, %d total', wss.clients.size)

  ws.on('error', function (err) {
    log.error('ws client error')
    log.error(err.stack)
  })
  ws.on('close', function (code, msg) {
    // close codes are defined on Web Socket RFC
    // see https://tools.ietf.org/html/rfc6455#section-7.4
    log.info('ws client close (%d) "%s", %s left', code, msg, wss.clients.size)
    server.emit('ws:close', wss.clients)
  })
  // re-emit connection on server
  server.emit('ws:connection', ws)
  // re-emit message events from this websocket on server
  ws.on('message', function (data) {
    server.emit('ws:message', ws, data)
  })
})

exports.broadcast = function (data, options, callback) {
  log.debug('broadcast "%s" to %d clients', data, wss.clients.size)
  for (let ws of wss.clients) ws.send(data, options, callback)
  return this
}
