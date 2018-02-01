
var wsHost = 'ws://' + document.location.host
var ws = null

// DOM elements
var inh1 = null
var view = null

function message (str) {
  view.innerHTML = str + '\n' + view.innerHTML
}

function connect (callback) {
  if (ws) {
    message('reconnecting web socket...')
    ws.onclose = connect
    return ws.close()
  }
  message('connecting web socket to ' + wsHost)
  ws = new WebSocket(wsHost)

  ws.onopen = function (event) {
    message('websocket opened')
  }
  ws.onerror = function (err) {
    message('could not open websocket')
    message(err.stack || err.message || err)
  }
  ws.onclose = function (event) {
    message('websocket disconected')
  }
  ws.onmessage = function (event) {
    command(event.data)
  }
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
command.exit = function exit () {
  message('EXIT request from server')
  message('Closing window in 2 sec')
  return setTimeout(window.close.bind(window), 2000)
}
command.stdin = function stdin (key) {
  switch (key) {
    case 'Backspace':
      inh1.innerHTML = inh1.innerHTML.slice(0, -1)
      break
    case 'Enter':
      command(inh1.innerHTML.slice(2))
      inh1.innerHTML = inh1.innerHTML.slice(0, 2)
      break
    default:
      if (key === 'Space') key = ' '
      inh1.innerHTML = inh1.innerHTML + key
  }
}

// TODO use https://github.com/cms/domready/blob/master/domready.js
document.addEventListener('DOMContentLoaded', function () {
  view = document.querySelector('#terminal')
  inh1 = document.querySelector('#stdin')
  connect()
  document.querySelector('#ping').onclick = function () {
    ws.send('ping')
  }
  document.querySelector('#main_action').onclick = function () {
    ws.send('main action click')
  }
  var input = document.querySelector('#input')
  document.querySelector('#send').onclick = function () {
    var msg = input.value
    msg ? ws.send(msg) : message('nothing to send! ')
  }
})
