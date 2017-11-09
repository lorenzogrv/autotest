
var path = require('path')
var budo = require('budo')
var babelify = require('babelify')

module.exports = iaido

function iaido (args) {
  console.log('running iai-do cli')
  var pwd = process.cwd()
  console.log('current pwd:', pwd)

  var resolve = (str) => path.resolve(pwd, str)

  console.log('running iai-do cli')
  try {
    var pkg = require(resolve('package.json'))
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err
    }
    console.error('there is no package.json file at %s', pwd)
    process.exit(1)
  }

  if (!pkg.name) throw new Error('no "name" field in package.json')
  if (!pkg.main) throw new Error('no "main" field in package.json')
  if (!pkg.browser) throw new Error('no "browser" field in package.json')

  console.log('project name: ', pkg.name)
  console.log('backend entry: ', pkg.main)
  console.log('browser entry: ', pkg.browser)

  budo('./' + pkg.browser, {
    title: pkg.name,
    live: true,             // setup live reload
    port: 8000,             // use this port
    dir: resolve('www'),
    browserify: {
      transform: babelify   // ES6
    },
    middleware: function (req, res, next) {
      console.log('middleware', req.url)
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
    .on('error', function (err) {
      console.error('got an error')
      console.error(err)
    })
}
