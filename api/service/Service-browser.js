const { EventEmitter } = require('events')
const abc = require('iai-abc')
const oop = require('iai-oop')

const Service = module.exports = new EventEmitter()

Service.create = function (uri) {
  // TODO assert this context is either Service or inherits Service

  // this create procedure may lead to bugs, it's experimental
  var instance = Object.create(this)
  // initialize emitter or pray something
  EventEmitter.call(instance)

  return oop(instance)
    // it's supossed this code is for browser so seems safe using document
    .visible('uri', uri || ('ws://' + document.location.host))
    .internal('_ws', null)
    .o
  instance.uri = uri // TODO this data descriptor should be non-writable

  return instance
}

Service.connect = function () {
  if (this._ws) {
    // TODO if already connected, should raise error instead?
    return this.emit('message', 'websocket already connected!')
    // if already connected, reconnect via 'onclose' event
    this._ws.close()
    return this
  }
  this.emit('message', 'connecting to ' + this.uri)
  this._ws = new WebSocket(this.uri)
  // TODO, define handlers here
  this._ws.onopen = this.onopen.bind(this)
  this._ws.onerror = this.onerror.bind(this)
  this._ws.onclose = this.onclose.bind(this)
  this._ws.onmessage = this.onmessage.bind(this)
  return this
}

// Websocket event handlers
Service.onopen = function (event) {
  this.emit('message', 'websocket opened')
}
Service.onerror = function (event) {
  this.emit('message', 'could not open websocket')
}
Service.onclose = function (event) {
  this.emit('message', 'websocket disconected.')
  this._ws = null

  var t = 5
  setTimeout(this.connect.bind(this), t * 1000 + 1)
  var Service = this
  var i = setInterval(function () {
    Service.emit('message', 'reconnecting in ' + t)
    if (!--t) clearInterval(i)
  }, 1000)
}
Service.onmessage = function (event) {
  // TODO just now, shoud re-think the whole thing
  this.emit('command', event.data)
}
// this is just a quick-n-dirty way to get it working now
Service.send = function () {
  this._ws.send.apply(this._ws, arguments)
  return this
}
