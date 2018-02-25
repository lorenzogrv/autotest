const $ = require('jquery')
const sock = require('./wsocket')
const command = require('./command')

var terminal
try {
  terminal = require('./terminal')
} catch (err) {
  fatal(err)
}

function fatal (error) {
  error = error ? error.stack || error.message || error : new Error('FATAL!')
  document.body.innerHTML = '<pre>' + error + '</pre>'
}

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

sock
  .on('message', (str) => terminal.stdout('sock: ' + str))
  .on('command', execute)

// TODO use https://github.com/cms/domready/blob/master/domready.js
document.addEventListener('DOMContentLoaded', function () {
  try {
    terminal.display().done(() => $('#home').hide() && sock.connect())
  } catch (err) {
    fatal(err)
  }

  document.querySelector('#main_action').onclick = function () {
    sock.send('main action click')
  }
  $(document.body).addClass('loaded')
})
