/**
 * An object manipulation utility
 */

var exports = module.exports = put;

exports.version = '1';
exports.stability = 2;

/**
 * @function put: Sets on @where as many enumerable properties as @from has.
 *   @returns where param
 */

function put( from, where ){
  for( var key in from ){
    where[key] = from[key]
  };
  return where;
};
