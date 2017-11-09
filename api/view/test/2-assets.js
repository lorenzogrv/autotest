var test = require('tape');
var iai = require('iai-abc');

var View = require('..');
var path = iai.path(__dirname + '/..' );
var jquery = path.to('node_modules/jquery/dist/jquery.js');

test('view#source and View.media (programatic)', function( t ){
  var view = View.constructor( '' );
  t.equal( typeof view.source, 'function', 'should be a function' );
  
  view.source('/jquery.js', jquery)
  t.equal( view.media['/jquery.js'], jquery,
    'should add given key-value pair at the view.media object' );
  t.equal( View.media['/jquery.js'], jquery,
    'View.media object should be shared within all instances' );

  View.media = null;
  t.notEqual( View.media, null, 'media map should be non-writable' );
  view.media = null;
  t.notEqual( view.media, null, 'even at view instances' );
  t.notEqual( View.media, null, 'so the media map is always there' );
  t.deepEqual( View.media, view.media, 'shared for every view' );

  t.doesNotThrow(function(){
    view.source('/foo.css', 'unexistant/file/path');
  }, 'mapping to an unexistant file should not throw');

  t.throws(function(){
    view.source('/', 'foo/bar');
  }, iai.Error, 'mapping the root ("/") should throw');

  t.end();
});

var fs = require('fs');
var PassThrough = require('stream').PassThrough;
function restub( onend ){
  var res = new PassThrough(), body = '';
  res.statusCode = undefined;
  res
    .setEncoding('utf8')
    .on('data', function( chunk ){ body += chunk; })
    .on('end', function(){ onend( res.statusCode, body ); } )
  ;
  return res;
}

test('view#answer (serve media)', function( t ){
  var view = View.constructor( '' );
  view.source( '/fruits.css', path.to('test/fruits.css') );
  view.source( '/file.css', path.to('test/unexistant-file.css') );
  view.source( '/dir.css', path.to('test/unexistant-dir/file.css') );

  t.plan(5);
  t.equal( typeof view.answer, 'function', 'should be a function' );
  // hide error messages for this test
  var log = iai.Log.constructor.findOne(/View.js$/);
  var prev = log.level; log.level = log.FATAL;

  view.answer({ url: '/fruits.css' }, restub(function( code, body ){
    t.equal( code, 200, 'status code should be 200' );
    t.equal( body, fs.readFileSync( path.to('test/fruits.css'), 'utf8' ),
      'request body should be the file contents' );
  }));

  view.answer({ url: '/file.css' }, restub(function( code, body ){
    t.equal( code, 500, 'status code should be 500 for unexistant files' );
  }));

  view.answer({ url: '/dir.css' }, restub(function( code, body ){
    log.level = prev; // restore previous log level
    t.equal( code, 500, 'code 500 even for unexistant directories' );
  }));
});

// TODO once constructed, view should research sources (js, css, img?)
//var fixture2 = require('fs').readFileSync(__dirname+'/h5bp.html', 'utf8');
test.skip('view#source and View.media (automatic)');
