module.exports = sources

/**
 * @function sources: Researches the file dependencies of a commonjs module
 * @param mod: The commonjs module to research in
 * @returns Array
 */

function sources (mod) {
  return mod.children
    // module may have a child referencing itself (circular dependency)
    .filter((module) => module !== mod)
    // now it's safe to map over without causing an infinity loop
    .map(sources)
    .reduce((prev, now) => prev.concat(now), [])
    .concat(mod.filename)
    // remove duplicates
    .filter((name, pos, arr) => arr.indexOf(name) === pos)
}
