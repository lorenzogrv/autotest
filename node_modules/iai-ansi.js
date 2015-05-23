"use strict";

/**
 * exposes codes for commonly implemented ansi term control sequences
 *
 * Ex: `console.log( ansi.bold + ansi.red + 'HELLO WORLD' + ansi.reset);`
 *
 * Taken primarily from https://github.com/creativelive/simple-ansi/blob/master/ansi.js
 *
 */

var exports = module.exports = {};

// see ['\x1b' to avoid "use strict"; error](http://en.wikipedia.org/wiki/ANSI_escape_code)
// http://www.vt100.net/docs/vt102-ug/table5-2.html
exports.esc = '\x1b[';

// text formating
exports.reset = exports.esc + '0m';
exports.bold = exports.esc + '1m';
exports.underline = exports.esc + '4m';
exports.blink = exports.esc + '5m';

// foreground colors
exports.gray = exports.esc + '30m';
exports.red = exports.esc + '31m';
exports.green = exports.esc + '32m';
exports.yellow = exports.esc + '33m';
exports.blue = exports.esc + '34m';
exports.magenta = exports.esc + '35m';
exports.cyan = exports.esc + '36m';
exports.white = exports.esc + '37m';

// background colors
exports.bgGray = exports.esc + '40m';
exports.bgRed = exports.esc + '41m';
exports.bgGreen = exports.esc + '42m';
exports.bgYellow = exports.esc + '43m';
exports.bgBlue = exports.esc + '44m';
exports.bgMagenta = exports.esc + '45m';
exports.bgCyan = exports.esc + '46m';

// erase display
exports.clear = exports.esc + '2J';
exports.clearEnd = exports.esc + '0J';
exports.clearBegin = exports.esc + '1J';

// cursor control
exports.save = exports.esc + 's';
exports.restore = exports.esc + 'u';
exports.home = exports.esc + 'H';
exports.moveTo = exports.esc + '%d;%dH';

// scroll control
exports.scroll = exports.esc + 'r';

// TODO refactor and add sequences
// http://www.termsys.demon.co.uk/vtansi.htm

if( process.env.NODE_ENV == 'test' && require.main == module ){
  var assert = require('assert');
  console.log( "tests started for", __filename );

  assert.equal( exports.esc, '\x1b[', "escape sequence" );
  assert.equal( exports.reset, '\x1b[0m', "white foreground" );
  assert.equal( exports.bold, '\x1b[1m', "bold text" );
  assert.equal( exports.underline, '\x1b[4m', "underline text" );
  assert.equal( exports.blink, '\x1b[5m', "blink text" );

  assert.equal( exports.gray, '\x1b[30m', "gray foreground" );
  assert.equal( exports.red, '\x1b[31m', "red foreground" );
  assert.equal( exports.green, '\x1b[32m', "green foreground" );
  assert.equal( exports.yellow, '\x1b[33m', "yellow foreground" );
  assert.equal( exports.blue, '\x1b[34m', "blue foreground" );
  assert.equal( exports.magenta, '\x1b[35m', "magenta foreground" );
  assert.equal( exports.cyan, '\x1b[36m', "cyan foreground" );
  assert.equal( exports.white, '\x1b[37m', "white foreground" );

  assert.equal( exports.bgGray, '\x1b[40m', "gray foreground" );
  assert.equal( exports.bgRed, '\x1b[41m', "red foreground" );
  assert.equal( exports.bgGreen, '\x1b[42m', "green foreground" );
  assert.equal( exports.bgYellow, '\x1b[43m', "yellow foreground" );
  assert.equal( exports.bgBlue, '\x1b[44m', "blue foreground" );
  assert.equal( exports.bgMagenta, '\x1b[45m', "magenta foreground" );
  assert.equal( exports.bgCyan, '\x1b[46m', "cyan foreground" );

  assert.equal( exports.clear, '\x1b[2J', "clear screen" );
  assert.equal( exports.clearEnd, '\x1b[0J', "clear screen to end" );
  assert.equal( exports.clearBegin, '\x1b[1J', "clear screen to begin" );

  assert.equal( exports.save, '\x1b[s', "save cursor position" );
  assert.equal( exports.restore, '\x1b[u', "restore cursor position" );
  assert.equal( exports.moveTo, '\x1b[%d;%dH', "move cursor to %d, %d" );

  assert.equal( exports.scroll, '\x1b[r', "enable scrolling" );

  console.log( "tests succeed for", __filename );
}
