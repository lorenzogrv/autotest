/**
 * @dependencies
 */

var is = require('iai-is')
  , oop = require('iai-oop')
  , path = require('path')
;

is.Array = Array.isArray;

/**
 * @package
 */


var exports = module.exports = Module;

exports.version = '1';
exports.stability = 1;

/**
 * @builder Module
 *   @param components (Hash): Optional. Can contain the following keys:
 *
 * - app: A function that serves as request handler. It receives 2 arguments:
 *     - request, an http.ClientRequest.
 *     - response, an http.ServerResponse.
 * - server: An EventEmitter instance that emits 'request' events.
 * - service: An array of iai.core.Service instances.
 */

function Module( components ){
  if( !is.Literal(components) ){
    throw TypeError("components must be a Hash");
  }
  if( !is.AbsolutePath(components.dirname) ){
    throw TypeError("components.dirname must be an absolute path");
  }
  if( components.backend && !is.Literal(components.backend) ){
    throw TypeError("components.backend must be a Hash");
  }
  if( components.frontend && !is.Literal(components.frontend) ){
    throw TypeError("components.frontend must be a Hash");
  }

  var instance = oop.create( Module.prototype )
    .visible('components', components)
    .visible('name',  path.basename(components.dirname) )
    //.visible('frontend',  (components.frontend || []).map(join) )
    .visible('backend',  {})
    .o
  ;

  function join( val ){ return path.join( components.dirname, val ); }

  var backend = Object.create(components);

  delete backend.dirname;
  delete backend.frontend;


  function requireEach( obj, store ){
    Object.keys(obj).forEach(function( key ){
      console.log( "key", key ).
      this[ path.basename(key) ] = require( join(key) );
    }, store)
  }

//  requireEach( backend, instance. )

  Object.keys(backend)
    // remove file extensions
    //.map(function(val){ return val.replace(/\.[^\.]+/, '') })
    .forEach(function(val){
      console.log( "key", val)
      var parts = val.split(path.sep);
      while( parts.lengh ){
        var part = parts.shift();
        if( !this[part] ){
          this[part] = [];
        }
      }
      console.log(  )
    }, instance.backend)
  ;
  console.log( path.join(instance.name, "algo") )
  return instance;
}

/*Module.Conf = function(){
  return Object.create( Module.Conf.prototype );
};

Module.Conf.prototype = {
  set: function(){},
  get: function(){},
  enable: function(){},
  disable: function(){}
}*/

Module.prototype = {
  /**
   * @function server: adds a service.
   * A service is an object that listens on a server.
   */
  service: function( service ){
    // check server is an EventEmitter
    if( !(service instanceof Service) ){
      throw TypeError("service must be an instanceof iai.core.Service");
    }
    this.components.services.push( service )
    return this;
  },

  /**
   * @function mount: mounts a module on this one.
   * A module is a iai.core.Module instance.
   */
  mount: function( module ){
    // check module is a iai.core.Module instance.
    return this;
  }
}
