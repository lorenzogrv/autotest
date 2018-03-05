const { Section } = require('iai-api')

var devtool = module.exports = Section.create('devtool')

devtool.stdout = function (str) {
  this.$.innerHTML = str + '\n' + this.$.innerHTML
  return this
}
