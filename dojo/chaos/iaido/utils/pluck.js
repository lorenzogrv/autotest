/**
 * An object manipulation utility
 */

var exports = module.exports = pluck;

exports.version = '1';
exports.stability = 2;

/**
 * Pluck out a key value from an array of objects as a single array.
 *
 * @example
 * people = [{ age: 30, name: 'Paul' }, { age: 28, name: 'Nicole'}];
 * pluck( people, 'name' );
 * // => ['Paul', 'Nicole']
 *
 * @param  {array}  input Array of objects.
 * @param  {string} key   Key index of items to list.
 * @return {array}        List of values for `key`.
 */

function pluck( input, key ){
  if( !Array.isArray(input) ){
    return input;
  }

  return input.map(function( obj ){
    return obj[ key ];
  })
};
