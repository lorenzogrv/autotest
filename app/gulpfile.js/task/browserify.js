const browserify = require('browserify')
const bundler = require('./_bundler')

const log = require('iai-abc').log
log.level = log.VERB

module.exports = function () {
  var b = browserify(bundler.options)
    // catch out browserify errors
    .on('error', err => log.fatal(1, err.stack))
  return bundler(b)
}
