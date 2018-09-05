const bundler = require('./_bundler')
const watchify = require('watchify')
const browserify = require('browserify')

const abc = require('iai-abc')
const oop = abc.oop

const log = abc.log
log.level = log.VERB

// this should be the same as browserify task, but with watchify
module.exports = function () {
  var opts = oop.extend(bundler.options, watchify.args)
  var b = watchify(browserify(opts))
    // log watchify messages
    .on('log', msg => log.info('watchify:', msg))
    // catch out watchify uptates to re-bundle
    .on('update', () => log.warn('re-bundling...') + bundler(b))

  return bundler(b).on('finish', function () {
    log.info('watchify bundler will re-bundle on updates')
    abc.proc.ignoreSIGINT()
    log.warn('Use Ctrl+C to stop watchify')
    process.once('SIGINT', () => {
      log.warn('stoping watchify...')
      b.close()
    })
  })
}
