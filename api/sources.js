module.exports = sources;

/**
 * @function sources: Researches the file dependencies of a commonjs module
 * @param mod: The commonjs module to research in
 * @returns Array
 */

function sources( mod ){
  return []
    .concat.apply( [], mod.children.map(sources) )
    .concat( mod.filename )
    // remove duplicates
    .filter(function( name, pos, arr ){ return arr.indexOf(name) == pos; })
  ;
}
