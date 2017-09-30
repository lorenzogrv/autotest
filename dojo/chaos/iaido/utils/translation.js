/**
 * A utility function to ease the i18n
 */

var exports = module.exports = translate;

exports.version = '1';
exports.stability = 1;

// Lol? are you kidding me? ;)
var cache = {}

function translate( text ){
  return cache[text] || (cache[text] = text);
}

exports.lazy = function(text){
  return { toString: function(){
    return translate.apply( null, arguments );
  }}
}
