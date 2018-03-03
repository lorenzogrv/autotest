const { EventEmitter } = require('events')
const os = require('os')
const http = require('http')
const WebSocketServer = require('ws').Server

const abc = require('iai-abc')
const oop = abc.oop
const log = abc.log

log.level = abc.Log.VERB

var Service = module.exports = new EventEmitter()

Service.create = function Service (opts) {
  // TODO assert this context is either Service or inherits Service
  // TODO opts
  // this create procedure may lead to bugs, it's experimental
  var instance = Object.create(this)
  EventEmitter.call(instance) // initialize emitter or pray something

  oop(instance)
    // TODO https
    .internal('_server', http.createServer())
    .internal('_wss', new WebSocketServer({ server: instance._server }))

  log.info('created %s', instance)
  return instance
}

Service.listen = function () {
  if (!this._server || !this._wss) {
    throw ReferenceError('missing internal variables')
  }
  // Web Socket Integration
  // Never implement here details of what to do with messages, nor send data
  this._wss.on('connection', (ws) => {
    log.info('ws client connected, %d total', this._wss.clients.size)
    // re-emit websocket connection on server
    this._server.emit('ws:connection', ws
      // re-emit message events from this websocket on service object
      .on('message', (data) => this.emit('ws:message', ws, data))
      // handle websocket errors
      .on('error', function (err) {
        log.error('ws client error %s', err.message)
        log.error(err.stack)
      })
      // close codes are defined on Web Socket RFC
      // see https://tools.ietf.org/html/rfc6455#section-7.4
      .on('close', (code, msg) => {
        log.info('ws client close (%d) "%s", %s left', code, msg, this._wss.clients.size)
        this._server.emit('ws:close', this._wss.clients)
      })
    )
  })
  this._server
    // log address where service is listening
    .on('listening', function () {
      var url = 'http://' + os.hostname() + ':' + this.address().port
      log.info('server listening @ %s', url)
    })
    // log each request received
    .on('request', (req, res) => {
      log.verb('%s requested %s', req.connection.remoteAddress, req.url)
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
      this.emit('request', req, res)
    })
    .listen.apply(this._server, arguments)
  return this
}

Service.broadcast = function (data, options, callback) {
  log.debug('broadcast "%s" to %d clients', data, this._wss.clients.size)
  for (let ws of this._wss.clients) ws.send(data, options, callback)
  return this
}
