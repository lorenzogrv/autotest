'use strict'

/**
 * exposes codes for commonly implemented ansi term control sequences
 *
 * Ex: `console.log( ansi.bold + ansi.red + 'HELLO WORLD' + ansi.reset);`
 *
 * Taken primarily from https://github.com/creativelive/simple-ansi/blob/master/ansi.js
 *
 */

var exports = module.exports = require('./index')

// cleanout every sequence for browserifyed code
Object.keys(module.exports).forEach(function (key) {
  module.exports[key] = ''
})

exports.reset = ''

if (process.env.NODE_ENV === 'test' && require.main === module) {
  var assert = require('assert')
  console.log('tests started for', __filename)

  assert.equal(exports.esc, '', 'escape sequence')
  assert.equal(exports.reset, '', 'white foreground')
  assert.equal(exports.bold, '', 'bold text')
  assert.equal(exports.underline, '', 'underline text')
  assert.equal(exports.blink, '', 'blink text')

  assert.equal(exports.gray, '', 'gray foreground')
  assert.equal(exports.red, '', 'red foreground')
  assert.equal(exports.green, '', 'green foreground')
  assert.equal(exports.yellow, '', 'yellow foreground')
  assert.equal(exports.blue, '', 'blue foreground')
  assert.equal(exports.magenta, '', 'magenta foreground')
  assert.equal(exports.cyan, '', 'cyan foreground')
  assert.equal(exports.white, '', 'white foreground')

  assert.equal(exports.bgGray, '', 'gray foreground')
  assert.equal(exports.bgRed, '', 'red foreground')
  assert.equal(exports.bgGreen, '', 'green foreground')
  assert.equal(exports.bgYellow, '', 'yellow foreground')
  assert.equal(exports.bgBlue, '', 'blue foreground')
  assert.equal(exports.bgMagenta, '', 'magenta foreground')
  assert.equal(exports.bgCyan, '', 'cyan foreground')

  assert.equal(exports.clear, '', 'clear screen')
  assert.equal(exports.clearEnd, '', 'clear screen to end')
  assert.equal(exports.clearBegin, '', 'clear screen to begin')

  assert.equal(exports.save, '', 'save cursor position')
  assert.equal(exports.restore, '', 'restore cursor position')
  assert.equal(exports.moveTo, '', 'move cursor to %d, %d')

  assert.equal(exports.scroll, '', 'enable scrolling')

  console.log('tests succeed for', __filename)
}
