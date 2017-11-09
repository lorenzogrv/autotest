model = require('./');

var exports = module.exports = requireDbBuilder

exports.version = "0";
exports.stability = 2;

function requireDbBuilder( system, builder ){
  system = system || 'undefined';
  try {
    return model( system.toLowerCase()+'/'+system+builder );
  } catch(err) {
    if( !/because cannot find module/i.test(err.message) ){
      throw err;
    }
    throw Error( "Unsupported database management system: "+system );
  }
}
