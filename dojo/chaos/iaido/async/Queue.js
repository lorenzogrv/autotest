var oop = require( 'iai-oop' )
  , Parent = require( './Notifier' )
  , isFn = require( 'iai-is' )( 'Function' )
  , slice = Function.prototype.call.bind( Array.prototype.slice )
;

/**
 * @builder queue: Process data according to first in - first out principle.
 *   @param worker[Function]
 *
 * Creates a queue object. Objects pushed the queue will be processed by worker
 * in the order they are given. While an object is being processed, next objects
 * will be queued until worker finishes processing. Each worker process executes
 * on `process.nextTick` to allow better debugging.
 *
 * the worker function receives 3 arguments:
 *   1. the data to be processed. This is the object you push into the queue.
 *   2. a done callback, which optionally accepts the following arguments:
 *     - An Error instance or null.
 *     - 1 to n objects that will be pased on to the next worker call.
 *   3. an array with the extra arguments passed to the callback from the previous
 *      worker execution.
 */

var exports = module.exports = oop.builder(function Queue( worker ){
  if( !isFn(worker) ){
    throw TypeError( "worker must be a function" );
  }
  return oop( Parent.call(this) )
    .visible( 'worker', worker )
    .visible( 'stack', [] )
    .o
  ;
}, Parent.prototype, {
  push: function( object ){
    var q = this
      , callback = function done( err ){
          if( err ) {
            // remove any pending tasks from the stack
            q.stack.length = 0;
            q.emit('error', err);
          }
          // remove the task from the stack
          q.stack.shift();
          // preserve arguments if there are any
          if( q.stack.length && arguments.length > 1 ){
            q.stack[0] = q.stack[0].bind( null, slice(arguments, 1) )
          }
          // call the next task, or emit drain event
          process.nextTick( q.stack[0] || q.emit.bind( q, 'drained' ) );
        }
    ;
    // push the process on the stack
    q.stack.push( function( args ){
      try {
        q.worker( object, callback, args || [] );
      } catch(e) {
        q.emit( "error", e );
      }
    });
    q.emit( 'queued', q.stack );

    // call task if stack was empty
    if( q.stack.length < 2 ){
      this.emit( 'saturated' );
      process.nextTick( q.stack[0] );
    }
    return this;
  },
  toString: function(){
    return "[Queue #"+this.stack.length+" tasks left]";
  }
});

exports.version = "2";
exports.stability = 1;
