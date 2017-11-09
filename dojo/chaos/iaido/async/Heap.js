var oop = require( 'iai-oop' )
  , isFn = require( 'iai-is' )( 'Function' )
  , slice = Function.prototype.call.bind( Array.prototype.slice )
  , Parent = require( './Notifier' )
  , Queue = require( './Queue' )
;
/**
 * @builder Heap: wraps a Queue object
 * @inherits: Notifier
 * @pattern: Proxy
 */

var exports = module.exports = oop.builder(function Heap(){
  var instance = oop( Parent.call( this ) )
    .visible( 'heap', Queue(function worker( task, done, previous ){
      task.apply( instance, [done].concat(previous) );
    }) )
    .o
  ;
  // notify heap errors
  instance.heap.on( 'error', function( err ){
    instance.emit( 'error', err );
  });
  return instance;
}, Parent.prototype, {
  /*
   * @function task: Pushes a task on the heap
   *   @param task [Function(done)]: the function to be executed
   *   @returns the current context
   *
   * The task argument...
   *   - is executed as soon as the heap allows
   *   - the context refers the current api instance
   *   - receives 1 to N arguments
   *   - arg1 is a callback function.
   *   - arg2 & onwards are the extra arguments received by the callback on
   *     the previous task, if there are any.
   *   - the callback function accepts 1 to N arguments, 1 being an error or null,
   *     2 onwards being passed to the next task on the queue
   */
  task: function( task ){
    if( !isFn(task) || !task.length ){
      throw TypeError( "task must be a function and receive a done argument" );
    }
    this.heap.push(task);
    return this;
  },
  /*
   * @function then: Pushes a sync task on the heap.
   *   @param task [Function()]: the function to be executed
   *   @returns the current context
   *
   * Given task is executed within the context of the current api.
   *
   * Useful for "done" callbacks
   */
  then: function( task ){
    return this.task(function(done){
      task.apply( this, slice(arguments, 1) );
      done();
    })
  },
  /*
   * @function fail: binds an error listener that will be removed
   *                 on the next heap drained event.
   *   @param task [Function(error)]: the error handler
   */
  fail: function( fn ){
    this.heap.on( 'drained', this.removeListener.bind(this, 'error', fn) );
    return this.on( 'error', fn );
  },
  toString: function(){
    return "[Heap <"+this.heap+">]";
  }
})

exports.version = "2";
exports.stability = 2;
