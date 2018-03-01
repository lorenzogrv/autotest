const $ = require('jquery')
const iai = require('iai')
const sock = iai.service
const command = require('./command')
const terminal = require('./terminal')

function execute (cmdline) {
  try {
    command.run(cmdline)
  } catch (err) {
    terminal.log(err.stack)
    terminal.log('an error raised when running: ' + cmdline)
  }
}

command
  .on('stdin', terminal.keypress.bind(terminal))
  .on('stdout', (str) => terminal.stdout(str))

terminal
  .on('message', terminal.stdout)
  .on('command', execute)

iai.service
  .on('message', (str) => terminal.stdout('sock: ' + str))
  .on('command', execute)

// TODO use https://github.com/cms/domready/blob/master/domready.js
document.addEventListener('DOMContentLoaded', function () {
  alert(iai)
  try {
    terminal.display()
      .done(() => $('#home').hide())
      .done(() => iai.service.connect())
  } catch (err) {
    fatal(err)
  }

  document.querySelector('#main_action').onclick = function () {
    sock.send('main action click')
  }
  $(document.body).addClass('loaded')
})
