const { EventEmitter } = require('events')
const iai = require('iai')

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
// TODO not sure if iai.service.send should be called from here
command.ping = function ping () {
  iai.service.send('ping')
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
command.prompt = function askuser () {
  this.emit('server', prompt('Please insert here the data to be sent'))
}
command.alert = function showtext () {
  alert(Array.prototype.join.call(arguments, ' '))
}
