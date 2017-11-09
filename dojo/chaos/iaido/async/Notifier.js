var EventEmitter = require( 'events' ).EventEmitter
  , oop = require( 'iai-oop' )
;

/**
   * @builder Notifier: creates a new notifier object.
   * @pattern: Proxy
   *
   * Each notifier wraps a new event emitter which can only be accesed
   * through some methods [emit, on, once].
   */

var exports = module.exports = oop.builder(function Notifier(){
  var emitter = new EventEmitter();
  return oop.create( this )
    .delegate( emitter, 'on', 'once', 'emit', 'removeListener' )
              //,'removeAllListeners', 'listeners')
    .visible( 'listenerCount', EventEmitter.listenerCount.bind(null, emitter) )
    .o
  ;
}, {
  toString: function(){
    return "[object Notifier]";
  }
});

exports.version = "1";
exports.stability = 1;

