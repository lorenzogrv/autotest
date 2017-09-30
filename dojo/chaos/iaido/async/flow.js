/**
 * @dependencies
 */

var oop = require('iai-oop')
  , is = require('iai-is')
;


/**
 * @function flow: Create an async flow control helper.
 *
 */

var exports = module.exports = oop.callable(function(){
  var stack = flow.stack = [];
  return flow;
  function flow(){
  };
}, {
  next: function( fn ){
    if( !is.Fn(fn) ){
      throw TypeError("first arg must be a function")
    }
    this.stack.push(fn);
    return this;
  },
  iterate: function( iterable ){
    if( !iterable ){
      throw TypeError("first arg must be present")
    }
    return {
      step: (function( fn ){
        if( !fn || fn.length != 3 ){
          throw TypeError("first arg must be a function and must expect exactly 3 arguments");
        }
        for( var key in iterable ){
          this.next( function(){} );
        }
        return this;
      }).bind(this)
    };
  }
});

exports.version = '1';
exports.stability = 2;

function sequence(iterable, step, complete, context) {
  if( !isFn(step) || !isFn(complete) ){
    throw TypeError("please provide step and complete callbacks as functions");
  }
  var sequence = [], context = context || null;

  // push steps on sequence
  for( var key in iterable ) {
    sequence.push( step.bind( context, key, iterable[key], next) );
  }
  // start sequence
  process.nextTick( sequence[0] );

  // "next" function for steps
  function next(err){
    // remove completed step
    sequence.shift();
    // force complete if error
    if( err && err instanceof Error ){
      sequence.length = 0;
    } else if( err ){
      err = TypeError("sequence#next received non-error as error: "+err);
    }
    // continue or complete
    sequence.length? sequence[0]() : complete.call( context, err || null );
  }
};
