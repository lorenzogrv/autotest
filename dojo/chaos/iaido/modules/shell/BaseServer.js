var iai = require('iai')
  , oop = iai('oop')
  , Parent = iai('async/Notifier')
;

/**
   * @builder ShellServer
   *   @param manager: io.Manager instance
   *   @param namespace (Optional): io namespace name
   */

module.exports = oop.builder(function( manager, namespace ){
  if( !manager.of || !manager.sockets ){
    throw TypeError("expecting socket io")
  }

  var instance = Parent.call(this);
  instance.io = manager;
  instance.sockets = (namespace? manager.of(namespace) : manager.sockets)
    .authorization( instance.authorization.bind(instance) )
    .on( 'connection', instance.connection.bind(instance) )
  ;
  return instance;
}, Parent.prototype, {
  /**
   * # Misc #
   *
   * @function info: returns a string socket respresentation.
   */
  info: function( socket ){
    return socket.handshake.address.address;
  },
  /**
   * # Cliend connection handlers #
   *
   * @function authorization: Authorization handler for socket.io
   * @function connection: Handler for this.sockets 'connection' event.
   */
  authorization: function( handshake, callback ){
    var trust = this.io.get('trusted addresses') || []
      , address = handshake.address.address
    ;
    if( address == '127.0.0.1' || !!~trust.indexOf(address) ){
      return callback( null, true );
    }
    console.log( 'Unauthorized access for', address );
    callback( null, false );
  },
  connection: function( socket ){
    socket
      .on( 'disconnect', this.disconnect.bind(this, socket) )
      .on('execute', this.execute.bind(this, socket))
      .emit('log', "Welcome to '"+socket.namespace.name+"'.")
      .emit('log', "Others know you by "+this.info(socket)+".")
    ;
    var ns = socket.namespace;
    for( var id in ns.sockets ){
      if( id == socket.id ) continue;
      socket.emit('log', this.info(ns.sockets[id])+' is also connected.')
    }
    socket.broadcast.emit('log', this.info(socket)+" joined.");
    return this;
  },
  /**
   * # Client event handlers #
   *
   * @function disconnect: Handler for client 'disconnect' event.
   * @function execute: Handler for client 'execute' events.
   * @event execute(command, callback)
   */
  disconnect: function( socket ){
    this.sockets.emit('log', this.info(socket)+" disconnected.");
    return this;
  },
  execute: function( socket, cmd ){
    if( this.listenerCount('execute') ){
      return this.emit('execute', cmd, function callback(err, response){
        if( err ){
          return socket.emit('error', err);
        }
        console.log(socket.connection)
        socket.emit( 'response', cmd, response );
      });
    }
    var tellmemore = "' but server will not execute anything.";
    socket.emit( 'log', "Received '"+cmd+tellmemore );
    socket.broadcast.emit('log', this.info(socket)+" executed '"+cmd+tellmemore );
    return this;
  },
  /**
   * @function broadcast: Emits an event on all clients
   */
  broadcast: function( event, arg1, to, argN ){
    this.sockets.emit.apply( this.sockets, arguments );
    return this;
  }
});

/**
 * request handler to send client data
 */
module.exports.static = function(req, res){
  res.sendfile( __dirname+'/WebShellClient.js' );
};

module.exports.version = "1";
module.exports.stability = 1;
