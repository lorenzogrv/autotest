var oop = require('iai-oop')
  , Parent = require('./ErrorBuilder')
  , Ap = Array.prototype
;

/**
 * @builder ErrorList: An Error instance that wraps some Error instances.
 * @pattern Proxy
 *
 * ErrorList instances are array-like objects and implement some of
 * the Array.prototype functionalities.
 *
 * [see also](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype#Methods)
 */

module.exports = oop.builder(function(builder){
  if( builder ){
    if( 'function' != typeof this.builder ){
      throw new TypeError('builder should be a function')
    }
    if( !this.builder.prototype ){
      throw new ReferenceError('builder.prototype should exist')
    }
    if( !this.builder.prototype.name ){
      throw new ReferenceError('builder.prototype.name should exist');
    }
  } else {
    builder = this.builder;
  }
  return oop( builder.call(this, this.message) )
    .visible('builder', builder)
    //.visible('name', builder.prototype.name+this.name)
    .set('length', 0)
    .o
  ;
}, Parent.prototype, {
  name: 'ErrorList',
  builder: Parent,
  message: 'There are some errors.',
  // Adds one error to the end of the list and returns the list.
  push: function( error ){
    if( !(error instanceof this.builder) ){
      throw new TypeError( this.name+' can only contain '
                          +this.builder.prototype.name+' instances' );
    }
    Ap.push.call( this, error );
    return this;
  },
  // Removes the last error from the list and returns that error.
  pop: function(){
    return Ap.pop.call(this);
  },
  // Removes the first error from the list and returns that error.
  shift: function(){
    return Ap.shift.call(this);
  },
  // Adds one error to the front of the list and returns the new length.
  unshift: function(){
    return Ap.unshift.call(this);
  },
  // Joins all errors of the list into a string.
  join: function(){
    return Ap.join.apply(this, arguments)
  },
  // Returns an array with the results of calling a provided function
  // on every error in the list.
  map: function(){
    return Ap.map.apply(this, arguments);
  },
  each: function(){
    Ap.forEach.apply(this, arguments);
    return this;
  },
  // Returns an array consisting of the errors on the list.
  toArray: function(){
    return Ap.slice.call(this, 0);
  },
  // Returns an string representation of the list.
  toString: function(){
    return this.name
      + ' <' + this.builder.prototype.name + '>'
      + ' (' + (this.length||'empty') + ')'
      + ' [' + this.map(function(e){ return e+''; }).join(', ') + ']'
    ;
  }
});

module.exports.version = "1";
module.exports.stability = 2;
