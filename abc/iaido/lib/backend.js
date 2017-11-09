
var oop = require('iai-oop')

oop(module.exports)
  .visible('require', require)
  .set('cli', require('./cli'))
