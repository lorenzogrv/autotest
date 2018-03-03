const { EventEmitter } = require('events')
const oop = require('iai-oop')
// const abc = require('iai-abc')
// const log = abc.log

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
    // TODO if already connected, should raise error instead?
    this.emit('message', 'websocket already connected!')
    // if already connected, reconnect via 'onclose' event
    this._ws.close()
    return this
  }
  this.emit('message', 'connecting to ' + this.uri)
  this._ws = new WebSocket(this.uri)
  // TODO, define handlers here
  // Websocket event handlers
  this._ws.onopen = (event) => {
    this.emit('message', 'websocket opened')
  }
  this._ws.onerror = (event) => {
    this.emit('message', 'could not open websocket')
  }
  this._ws.onclose = (event) => {
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
  this._ws.onmessage = (event) => {
    // TODO just now, shoud re-think the whole thing
    this.emit('command', event.data)
  }
}

// this is just a quick-n-dirty way to get it working now
Service.send = function () {
  this._ws.send.apply(this._ws, arguments)
  return this
}
