const $ = require('jquery')
const iai = require('iai-api')
const log = iai.log
const service = iai.service
const command = require('./command')
const terminal = require('./terminal')

log.level = iai.Log.VERB

function execute (cmdline) {
  try {
    command.run(cmdline)
  } catch (err) {
    log.error('an error raised when running: ' + cmdline)
    throw err
  }
}

command
  .on('stdin', terminal.keypress.bind(terminal))
  .on('stdout', (str) => log.info('cmd: ' + str))

terminal
  .on('message', log.info.bind(log))
  .on('command', execute)

service
  .on('command', execute)
  .on('connection', () => {
    log.info('iai.service has connected')
    // TODO belongs here?
    document.querySelector('#main_action').onclick = function () {
      service.send('main action click')
    }
    $(document.body).addClass('loaded')
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
