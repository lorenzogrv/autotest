/**
 * A very simple debugging utility
 */

var exports = module.exports = replaceTags;

exports.version = '1';
exports.stability = 2;

var is = require( 'iai-is' );

var TAG_RE = /%[\[|\(](\w*)[\]|\)]([sd])/;

function replaceTags( str, data ) {
  if( !is.String(str) || !is.Literal(data) ){
    throw TypeError( "please call replaceTags correctly" );
  }
  var match, value;
  while( match = TAG_RE.exec(str) ){
    value = data[ match[1] ];
    // Type cast
    switch( match[2] ){
      case 'd': value = Number(value); break;
      case 's': value = String(value); break;
    }
    // Special cases
    if ( value === undefined ) {
      value = 'undefined';
    } else if ( isNaN( value ) ) {
      value = 'NaN';
    }
    str = str.replace( match[0], value.toString() );
  }
  return str;
}
