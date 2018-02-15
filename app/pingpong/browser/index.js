
const wsock = require('./wsocket.js')

var sock = Object.create(wsock)

// DOM elements
var inh1 = null
var view = null

function message (str) {
  view.innerHTML = str + '\n' + view.innerHTML
}

function command (cmdline) {
  try {
    command.run(cmdline)
  } catch (err) {
    message(err.stack)
    message('an error raised when running: ' + cmdline)
  }
}
command.run = function run (cmdline) {
  var argv = cmdline.split(' ')
  var cmd = argv.shift()
  if (typeof command[cmd] !== 'function') {
    return message('Error: command not found: ' + cmd)
  }
  command[cmd].apply(this, argv)
}
command.echo = function echo () {
  message(Array.prototype.slice.call(arguments).join(' '))
}
// TODO not sure if sock.send should be called from here
command.ping = function ping () {
  sock.send('ping')
}
command.exit = function exit () {
  message('EXIT request from server')
  message('Closing window in 2 sec')
  return setTimeout(window.close.bind(window), 2000)
}
command.stdin = function stdin (key) {
  if (key.length === 1) {
    inh1.innerHTML += key
    return
  }
  switch (key) {
    case 'Space':
      inh1.innerHTML += ' '
      break
    case 'Backspace':
      inh1.innerHTML = inh1.innerHTML.slice(0, -1)
      break
    case 'Enter':
      command(inh1.innerHTML)
      inh1.innerHTML = ''
      break
    default:
      message('unbound key: ' + key)
  }
}

// TODO use https://github.com/cms/domready/blob/master/domready.js
document.addEventListener('DOMContentLoaded', function () {
  view = document.querySelector('#terminal')
  inh1 = document.querySelector('#stdin')

  sock
    .on('message', message)
    .on('command', command)
    .connect()

  document.querySelector('#main_action').onclick = function () {
    sock.send('main action click')
  }
})
  var input = document.querySelector('#input')
  document.querySelector('#send').onclick = function () {
    var msg = input.value
    msg ? sock.send(msg) : message('nothing to send! ')
  }
