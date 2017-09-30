/**
 * A very simple debugging utility
 */

var exports = module.exports = inspector;

exports.version = '1';
exports.stability = 1;

function inspector( o, hide ){
  return console.log( inspect(o, { colors: true, showHidden: !hide }) );
}

var inspect = require('util').inspect;
