const { resolve, dirname } = require('path')

module.exports = packdata

/**
 * @function packdata: Researches the package that $PWD/file belongs to
 * @param path (Optional): The path to a file/directory (relative to $PWD)
 * @returns Object
 */

function packdata (path) {
  var pwd = resolve(process.cwd(), path || '')

  while (pwd.length > 1) {
    try {
      // TODO if verbose log('TRY %s', resolve(pwd, 'package.json'))
      var pkg = require(resolve(pwd, 'package.json'))
      break
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') throw err
      pwd = dirname(pwd)
    }
  }
  if (!pkg) throw new Error('It is not an npm packaje')
  pkg.dir = pwd
  return pkg
}
