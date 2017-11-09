var http = require('http');

var server = http.createServer();

server.on('listening', function(){
  console.log( server.address() );
});

server.listen();

