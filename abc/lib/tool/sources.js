module.exports = sources;

/**
 * @function sources: Researches the file dependencies of a commonjs module
 * @param mod: The commonjs module to research in
 * @returns Array
 */

function sources (mod) {
  return mod.children
     // avoid recursing indefinitely! module may have a child referencing itself
    .filter((module) => module === mod)
    .map(sources)
    .concat(mod.filename)
    // remove duplicates
    .filter((name, pos, arr) => arr.indexOf(name) === pos)
  ;
}
