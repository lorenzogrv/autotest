const $ = require('jquery')
const sock = require('./wsocket')
const command = require('./command')

const View = require('./View')

var terminal = View('terminal')
terminal.display = function () {
  return View.display.call(this).done(function () {
    terminal.inh1 = document.querySelector('#stdin')
    $('#home').hide()
  })
}
terminal.log = function message (str) {
  this.$.innerHTML = str + '\n' + this.$.innerHTML
}
terminal.keypress = function keypress (key) {
  if (key.length === 1) {
    this.inh1.append(key)
    return
  }
  switch (key) {
    case 'Space':
      this.inh1.innerHTML += ' '
      break
    case 'Backspace':
      this.inh1.innerHTML = this.inh1.innerHTML.slice(0, -1)
      break
    case 'Enter':
      command.run(this.inh1.innerHTML)
      this.inh1.innerHTML = ''
      break
    default:
      this.emit('stdout', 'unbound key: ' + key)
  }
}

command
  .on('stdin', terminal.keypress.bind(terminal))
  .on('stdout', terminal.log.bind(terminal))

sock
  .on('message', terminal.log.bind(terminal))
  .on('command', function (cmdline) {
    try {
      command.run(cmdline)
    } catch (err) {
      terminal.log(err.stack)
      terminal.log('an error raised when running: ' + cmdline)
    }
  })

// TODO use https://github.com/cms/domready/blob/master/domready.js
document.addEventListener('DOMContentLoaded', function () {
  terminal.display().done(() => sock.connect())

  document.querySelector('#main_action').onclick = function () {
    sock.send('main action click')
  }
  $(document.body).addClass('loaded')
})
