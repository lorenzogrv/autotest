const { EventEmitter } = require('events')

const sock = module.exports = new EventEmitter()

// TODO document may not exist on non-browser environment
sock.uri = 'ws://' + document.location.host

sock.ws = null

sock.connect = function () {
  var sock = this
  if (sock.ws) {
    sock.emit('message', 'websocket already connected!')
    return sock.ws.close()
  }
  sock.emit('message', 'connecting to ' + sock.uri)
  sock.ws = new WebSocket(sock.uri)
  sock.ws.onopen = sock.onopen.bind(sock)
  sock.ws.onerror = sock.onerror.bind(sock)
  sock.ws.onclose = sock.onclose.bind(sock)
  sock.ws.onmessage = sock.onmessage.bind(sock)
}

// Websocket event handlers
sock.onopen = function (event) {
  this.emit('message', 'websocket opened')
}
sock.onerror = function (event) {
  this.emit('message', 'could not open websocket')
}
sock.onclose = function (event) {
  this.emit('message', 'websocket disconected.')
  this.ws = null

  var t = 5
  setTimeout(this.connect.bind(this), t * 1000 + 1)
  var i = setInterval(function () {
    this.emit('message', 'reconnecting in ' + t)
    if (!--t) clearInterval(i)
  }, 1000)
}
sock.onmessage = function (event) {
  // TODO just now, shoud re-think the whole thing
  this.emit('command', event.data)
}
// this is just a quick-n-dirty way to get it working now
sock.send = function () {
  this.ws.send.apply(this.ws, arguments)
  return this
}
