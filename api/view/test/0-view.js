var test = require('tape');

var View = require('..');

test('View (exposed prototype)', function( t ){
  t.plan(2);
  t.equal( typeof View, 'object', 'should be provided' );
  t.equal( typeof View.constructor, 'function', 'should have a constructor' );
});

test('View instances', function( t ){
  t.plan(3);
  var view;
  t.doesNotThrow(function(){ view = View.constructor(); }, 'need no arguments');
  t.ok( view instanceof View.constructor, 'should be instanceof View');
  t.ok( View.isPrototypeOf(view), 'should inherit from View');
});


var fixture = require('fs').readFileSync(__dirname+'/fruits.html', 'utf8');
test('view#toString', function( t ){
  t.plan(2);
  var view = View.constructor( fixture );
  t.equal( view.toString(), fixture, 'should return the HTML source as-is');
  t.equal( view + '', fixture, 'even when toString call is implicit');
});
