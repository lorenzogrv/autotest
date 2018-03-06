module.exports = sources

/**
 * @function sources: Researches the file dependencies of a commonjs module
 * @param mod: The commonjs module to research in
 * @returns Array
 */

function sources (mod) {
  return mod.children
    // TAKE CARE OF CIRCULAR DEPENDENCIES
    // given module may have a child module referencing given module
    // given module may have a child module referencing an ancestor
    .filter((ch) => ch !== mod && !~parents(mod).indexOf(ch.id))
    // now it's safe to map over without causing an infinity loop
    .map(sources)
    // remove hierarchy structure
    .reduce((prev, now) => prev.concat(now), [])
    // remove duplicates
    // TODO needing this seems not good (may I optimize above?)
    .filter((name, pos, arr) => arr.indexOf(name) === pos)
    // given module also requires its own source file to work, ofc.
    .concat(mod.filename)
}

// To avoid recursing infinitely due to posible circular dependencies,
// current strategy is to research the ancestor hierarchy of each module
function parents (mod) {
  var result = []
  while (mod.parent !== require.main) {
    result.push(mod.parent.id)
    mod = mod.parent
  }
  return result
}
