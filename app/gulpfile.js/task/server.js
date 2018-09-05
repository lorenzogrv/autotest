const api = require('iai-api')

const log = api.log
log.level = log.VERB

const Job = require('../lib/Job')
const path = require('../lib/path')
const readkeys = api.readkeys

// spawns a job running the app server which restarts if backend sources change
module.exports = function () {
  log.info('populating backend on require.cache...')
  // TODO abc.sources.from(reference, callback)
  // TODO abc.sources.from(reference) => stream files
  const backend = path.app.to('backend')
  if (!api.Log.muted) {
    api.Log.muted = true
    require(backend)
    api.Log.muted = false
  } else {
    require(backend)
  }
  var keyboard = readkeys({ sigint: 12 })
    .on('finish', () => {
      log.warn('keystream has finish, unwatching job...')
      job.unwatch()
    })
    .on('end', () => log.warn('keystream has end'))
  var job = Job('node', [backend], {
    stdio: 'pipe',
    stdin: process.stdin.pipe(keyboard),
    watch: api.sources(require.cache[require.resolve(backend)])
  })
    .on('close', () => {
      log.warn('server job has closed')
      log.warn('keyboard capture may still be active (Use Ctrl+L to finish)')
      log.warn('watcher will still be running if keyboard capture is active')
    })
    .start()
  return process.stdout
}
