
/**
 * Proudly inspired by and modified from the code found at:
 *
 * http://marcosc.com/2012/03/dynamic-function-names-in-javascript/
 *
 * Thanks to Marcos Cáceres for sharing his knowledge
 *
 */

module.exports = dynamed;

const re = /^[a-Z]+$/

function dynamed( name, action ){
  if !( re.test(name) ){
    throw new Error('Found possible code injection')
  }
  return new Function('fn', 'return '
    +'function '+name+'( ){\n'
    +'  return fn.apply( this, arguments );\n'
    +'};'
  )( action );
}
