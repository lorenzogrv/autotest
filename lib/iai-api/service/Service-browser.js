const { EventEmitter } = require('events')
const oop = require('iai-oop')
const abc = require('iai-abc')
const log = abc.log

log.level = abc.Log.VERB

const Service = module.exports = new EventEmitter()

Service.create = function (uri) {
  // TODO assert this context is either Service or inherits Service

  // this create procedure may lead to bugs, it's experimental
  var instance = Object.create(this)
  // initialize emitter or pray something
  EventEmitter.call(instance)

  oop(instance)
    // it's supossed this code is for browser so seems safe using document
    .visible('uri', uri || ('ws://' + document.location.host))
    .internal('_ws', null)

  return instance
}

Service.connect = function () {
  if (this._ws) {
    // if already connected, reconnect via 'onclose' event
    // TODO if already connected, should raise error instead?
    log.warn('websocket already connected, closing to reconnect...')
    this._ws.close()
    return this
  }
  log.info('connecting to %s...', this.uri)
  this._ws = new WebSocket(this.uri)
  // TODO, define handlers here
  // Websocket event handlers
  this._ws.onopen = (event) => {
    console.log(event)
    log.info('connected to %s', this.uri)
    this.emit('connection')
  }
  this._ws.onerror = (event) => {
    console.log(event)
    log.error('could not open websocket')
  }
  this._ws.onclose = (event) => {
    console.log(event)
    log.warn('websocket disconected')
    this._ws = null

    var t = 5
    setTimeout(this.connect.bind(this), t * 1000 + 1)
    var i = setInterval(function () {
      log.verb('reconnecting in ' + t)
      if (!--t) clearInterval(i)
    }, 1000)
  }
  this._ws.onmessage = (event) => {
    try {
      event = JSON.parse(event.data)
    } catch (err) {
      if (err instanceof SyntaxError) {
        // no valid JSON response, asume it's a string command
        // TODO just now, shoud re-think the whole thing
        return this.emit('command', event.data)
      }
      // throw unknow errors
      throw err
    }
    if (event.name) {
      log.debug('emit %s(%s)', event.name, event.data || '')
      return this.emit(event.name, event.data)
    }
    throw new Error('invalid websocket response')
  }
}

// this is just a quick-n-dirty way to get it working now
Service.send = function (msg) {
  if (typeof msg !== 'string') {
    // TODO bypass buffer objects
    arguments[0] = JSON.stringify(msg)
  }
  this._ws.send.apply(this._ws, arguments)
  return this
}
