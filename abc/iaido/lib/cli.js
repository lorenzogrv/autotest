
var path = require('path')
// var budo = require('budo')
var babelify = require('babelify')

module.exports = iaido

function iaido (args) {
  console.log('running iai-do cli');
  var pwd = process.cwd()
  console.log('current pwd:', pwd)

  var resolve = (str) => path.resolve(pwd, str)

  console.log('running iai-do cli');
  var pkg = require(resolve('package.json'))

  console.log('project name: ', pkg.name)
  console.log('backend entry: ', pkg.main)
  console.log('browser entry: ', pkg.browser)

  return

  budo('./' + pkg.browser, {
    title: 'iaido',
    live: true,             // setup live reload
    port: 8000,             // use this port
    browserify: {
      transform: babelify   // ES6
    },
    middleware: function (req, res, next) {
      // TODO if pkg.main leads to a router
      next()
    }
  })
    .on('connect', function (ev) {
      console.log('Server running on %s', ev.uri)
      console.log('LiveReload running on port %s', ev.livePort)
    })
    .on('update', function (buffer) {
      console.log('bundle - %d bytes', buffer.length)
    })
    .on('reload', function (file) {
      console.log('reload - %s', file)
    })
}
