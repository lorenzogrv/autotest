
const sock = require('./wsocket')
const command = require('./command')

const View = require('./View')

// DOM elements
var inh1 = null
var view = null

function message (str) {
  view.innerHTML = str + '\n' + view.innerHTML
}

function keypress (key) {
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
      command.run(inh1.innerHTML)
      inh1.innerHTML = ''
      break
    default:
      this.emit('stdout', 'unbound key: ' + key)
  }
}

command
  .on('stdin', keypress)
  .on('stdout', message)

sock
  .on('message', message)
  .on('command', function (cmdline) {
    try {
      command.run(cmdline)
    } catch (err) {
      message(err.stack)
      message('an error raised when running: ' + cmdline)
    }
  })

// TODO use https://github.com/cms/domready/blob/master/domready.js
document.addEventListener('DOMContentLoaded', function () {
  var terminal = View('terminal')
  terminal.toString = function () {
    return View.toString.call(this) + '<h1 id="stdin"></h1>'
  }
  terminal.display()

  view = document.querySelector('#terminal')
  inh1 = document.querySelector('#stdin')

  sock.connect()

  document.querySelector('#main_action').onclick = function () {
    sock.send('main action click')
  }
})
