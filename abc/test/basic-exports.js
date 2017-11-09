var test = require('tape');

var abc = require('..');
var path = require('path');

test('dependencies', function( t ){
  // do not access through abc.tool so it gets not injected as child
  var sources = require('../lib/tool/sources');
  // do not resolve through abc.path.to so path does not inject too
  var mod = require.cache[ path.resolve(__dirname, '../lib/abc.js') ];
  // oop is used to define exports so it can't be lazy-loaded
  t.equal( sources(mod).length, 2, 'everything must be lazy except "iai-oop"' );
  t.end();
});

test('#oop', function( t ){
  var oop = require('iai-oop');
  t.deepEqual( abc.oop, oop, 'should refer the iai-oop module' );
  abc.oop = null;
  t.deepEqual( abc.oop, oop, 'should be non-writable' );
  delete abc.oop;
  t.deepEqual( abc.oop, oop, 'should be non-configurable' );
  t.end();
});

test('#is', function( t ){
  var is = require('iai-is');
  t.deepEqual( abc.is, is, 'should refer the iai-is module' );
  abc.is = null;
  t.deepEqual( abc.is, is, 'should be non-writable' );
  delete abc.is;
  t.deepEqual( abc.is, is, 'should be non-configurable' );
  t.end();
});

test('#Error', function( t ){
  t.equal( typeof abc.Error, 'function', 'should be a function');
  t.ok( abc.Error() instanceof Error, 'should return instances of Error' );
  t.ok( abc.Error() instanceof abc.Error, 'should return instances of itself' );
  t.equal(
    abc.Error('str %s %d %j', 'replace', 27, {}).message,
    'str replace 27 {}',
    'should provide node\'s util.format feature set'
  );
  t.end();
});

test('#Log', function( t ){
  t.equal( typeof abc.Log, 'object', 'should be an object' );
  t.deepEqual( abc.Log, require('../lib/log'), 'should be the log prototype' );
  t.end();
})

test('#log', function( t ){
  var log = abc.log;
  t.equal( log.filename, __filename,
    'should return a log instance bound to the caller file' );
  t.end();
});
