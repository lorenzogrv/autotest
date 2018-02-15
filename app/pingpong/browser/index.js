
const sock = require('./wsocket.js')
const command = require('./command')

// DOM elements
var inh1 = null
var view = null

function message (str) {
  view.innerHTML = str + '\n' + view.innerHTML
}

command
  .on('stdin', function (key) {
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
  })
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
  view = document.querySelector('#terminal')
  inh1 = document.querySelector('#stdin')

  sock.connect()

  document.querySelector('#main_action').onclick = function () {
    sock.send('main action click')
  }
})
