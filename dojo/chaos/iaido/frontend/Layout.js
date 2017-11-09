/**
 * @dependencies
 */

var iai = require('iai')
  , oop = iai('oop')
  , isFn = iai('is')('Function')
;

/**
 * @builder __filenamed: Wraps a template to be easily reused
 */

var exports = module.exports = oop.builder(function( template ){
  if( !isFn(template) || !template.length ){
    throw Error("template must be a function accepting 1 argument")
  }
  return oop.create(this)
    .set('template', template)
    .o
  ;
}, {
  /**
   * renders some content through the template function
   */
  render: function( content, locals, callback ){
    process.nextTick(function(){
      try {
        callback( null, this.template( oop.extend({
          layout: this,
          content: content || null
        }, locals)) );
      } catch(err){
        callback( err );
      }
    })
  }
  /**
   * handle an http request to a proper response
   */
  /*,handle: function( req, res ){
    this.render( null, { user: req.user }, function( err, result ){
      if( err ){
        throw err;
      }
      res.send( result );
    })
  }*/
})

exports.version = "1";
exports.stability = 1;
