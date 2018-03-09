var resolve = require( 'path' ).resolve;

module.exports = execute;

/**
 * execute the operation described by command
 *
 * @param {String} command the operation to be executed
 * @returns {*} the value returned by the operation
 */

function execute( command ){
  var argv = command.split(/\s/)
    , refs = argv.shift().split('.')
    , path = resolve( process.cwd(), 'operation', refs.shift() );
  ;
  try {
    path = require.resolve( path );
    delete require.cache[ path ];
    var operation = require( path );
  } catch( err ){
    if( err.code != 'MODULE_NOT_FOUND' ){
      throw err;
    }
    throw new ReferenceError("I can't find the operation " + path);
  }
  var value = operation, ref;
  while( ref = refs.shift() ){
    if( 'undefined' == typeof value[ref] ){
      throw new Error( value + "'s property '" + ref + "' is undefined" );
    }
    operation = value
    value = value[ ref ];
  }

  if( 'function' !== typeof value ){
    throw new Error( "This operation is not a function: " + argv[0] );
  }

  return value.apply( operation, argv );
}
