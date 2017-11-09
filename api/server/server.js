var http = require('http');
var WebSocketServer = require('ws').Server

var iai = require('iai-abc');
var log = iai.log;

var server = http.createServer();

server.on('listening', function(){
  log.warn( 'server listening at %j', this.address() );
})

var exports = module.exports = server;

var listen = exports.listen;
exports.listen = function( ){
  if( this === exports ){
    throw iai.Error('#listen only available for objects inheriting server');
  }
  return listen.apply( this, arguments );
};


// Web Socket Integration
// Never implement here details of what to do with messages
// Nor send messages from here!!
var wss = new WebSocketServer({ server: server });
var clients = [];
wss.on('connection', function( ws ){
  clients.push( ws );
  log.verb('client connected, %d total', clients.length);

  ws.on('close', function( code, msg ) {
    // close codes are defined on Web Socket RFC
    // see https://tools.ietf.org/html/rfc6455#section-7.4
    log.verb( 'client closed (%d) "%s"', code, msg );
    clients.splice( clients.indexOf(ws), 1 );
  });
  // re-emit connection on server
  server.emit('ws:connection', ws);
});

exports.broadcast = function( data, options, callback ){
  log.debug('broadcast to %d clients', clients.length);
  clients.forEach(function( ws ){ ws.send(data, options, callback); });
  return exports;
};

