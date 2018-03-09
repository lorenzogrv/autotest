const $ = require('jquery')
const iai = require('iai-api')
const log = iai.log
const service = iai.service
const command = require('./command')

log.level = iai.Log.VERB

function execute (cmdline) {
  try {
    command.run(cmdline)
  } catch (err) {
    log.error('an error raised when running: ' + cmdline)
    throw err
  }
}

var stdin = $('#stdin')[0]
function keypress (key) {
  if (!key) return
  if (!stdin) stdin = $('#stdin')[0]
  if (key.length === 1) {
    stdin.innerHTML += key
    return
  }
  switch (key) {
    case 'Space':
      stdin.innerHTML += ' '
      break
    case 'Backspace':
      stdin.innerHTML = stdin.innerHTML.slice(0, -1)
      break
    case 'Enter':
      execute(stdin.innerHTML)
      stdin.innerHTML = ''
      break
    default:
      log.warn('unbound key: ' + key)
  }
}

command
  .on('stdout', (str) => log.info('cmd: ' + str))

service
  .on('stdin:begin', () => $(stdin).addClass('reading'))
  .on('stdin', keypress)
  .on('stdin:end', () => $(stdin).removeClass('reading'))
  .on('command', execute)
  .on('connection', () => {
    log.info('iai.service has connected')
    service.send({ name: 'stdin:request' })
    // TODO belongs here?
    document.querySelector('#main_action').onclick = function () {
      service.send('main action click')
    }
    $('#stdin').on('click', () => service.send({ name: 'stdin:request' }))
    $(document.body).addClass('loaded')
    $('section.selected').removeClass('loading')
  })
  .connect()

// TODO use https://github.com/cms/domready/blob/master/domready.js
document.addEventListener('DOMContentLoaded', function () {
  /*try {
    terminal.display()
      .done(() => $('#home').hide())
      .done(() => iai.service.connect())
  } catch (err) {
    iai.fatal(err)
  }//*/
})
