
var path = require('path')
var budo = require('budo')
var babelify = require('babelify')

module.exports = iaido

function iaido (args) {
  var pwd = process.cwd()
  var resolve = (str) => path.resolve(pwd, str)
  var pkg = require(resolve('package.json'))

  console.log('current pwd is', pwd)
  console.log('project name: ', pkg.name)
  console.log('browser entry: ', pkg.browser)

  budo('./' + pkg.browser, {
    title: 'iaido',
    live: true,             // setup live reload
    port: 8000,             // use this port
    browserify: {
      transform: babelify   // ES6
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
