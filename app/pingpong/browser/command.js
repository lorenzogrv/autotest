const { EventEmitter } = require('events')
const sock = require('./wsocket.js')

var command = module.exports = new EventEmitter()

command.execute = function command (cmdline) {
  try {
    command.run(cmdline)
  } catch (err) {
    this.emit('stdout', err.stack)
    this.emit('stdout', 'an error raised when running: ' + cmdline)
  }
}
command.run = function run (cmdline) {
  var argv = cmdline.split(' ')
  var cmd = argv.shift()
  if (typeof command[cmd] !== 'function') {
    return this.emit('stdout', 'Error: command not found: ' + cmd)
  }
  command[cmd].apply(this, argv)
}
command.echo = function echo () {
  this.emit('stdout', Array.prototype.slice.call(arguments).join(' '))
}
// TODO not sure if sock.send should be called from here
command.ping = function ping () {
  sock.send('ping')
}
command.exit = function exit () {
  this.emit('stdout', 'EXIT request from server')
  this.emit('stdout', 'Closing window in 2 sec')
  return setTimeout(window.close.bind(window), 2000)
}
command.stdin = function stdin (key) {
  this.emit('stdin', key)
}
command.reload = function reload () {
  window.location.reload()
}
