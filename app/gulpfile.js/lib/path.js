const path = require('path')
const abc = require('iai-abc')

exports.gulpfile = abc.path(path.dirname(__dirname))

exports.app = abc.path(exports.gulpfile.to('..'))
exports.iai = abc.path(exports.app.to('..'))

if (require.main === module) {
  const assert = require('assert')
  assert.equal(exports.iai.to('.'), '/home/PROXECTOS/iai')
  assert.equal(exports.app.to('.'), '/home/PROXECTOS/iai/app')
  assert.equal(exports.gulpfile.to('.'), '/home/PROXECTOS/iai/app/gulpfile.js')
  console.log('OK')
}
