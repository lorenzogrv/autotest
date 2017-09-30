'use strict';

if( module ){
  var exports = module.exports = WebShell;
  exports.version = '1';
  exports.stability = 1;
}

function WebShell( element_id, socket_url ){
  // arg checking
  if( !element_id ){
    throw ReferenceError("element id for WebShell not specified");
  }

  // instance creation, attribute assign
  var instance = Object.create( WebShell.prototype );
  instance.box = document.getElementById( element_id );
  instance.input = document.createElement( 'input' );

  // put default styles, DOM insertions
  WebShell.put( instance.css_box, instance.box.style );
  WebShell.put( instance.css_input, instance.input.style );
  instance.clear();

  // UI events
  $(instance.input).on( 'keyup', function(event){
    event.preventDefault();
    event.stopPropagation();
    switch(event.keyCode){
      case 13: // enter
        instance
          .exec( instance.input.value )
          .once( "response", instance.focus.bind(instance) )
        ;
        instance.input.value = "";
        return;
      case 38: // up arrow
        return instance.prev();
      case 40: // down arrow
        return instance.next();
      default:
        var emit = [ "ctrl", "alt", "shift" ].reduce(function(prev, curr){
          return event[ curr+"Key" ]? (prev+curr+"-") : (prev || "");
        }, "") + event.keyCode;
        if( emit != event.keyCode ){
          console.log( "emit key combo>", emit );
        }
    }
  });
  $(instance.box).on( 'click', function(event){
    //event.preventDefault();
    instance.focus();
  });

  // connect via socket.io
  instance.connect( socket_url );

  return instance.clear().focus();
};

WebShell.prototype = {
  prompt: "> ",
  css_box: {
    //position: "relative",
    width: "98%",
    padding: "1%",
    height: "10em",
    overflowY: "scroll",
    //overflowX: "hidden",
    whiteSpace: "pre-wrap",
    //
    // custom look
    //margin: "1em 0",
    fontFamily: "monospace",
    color: "#ccc",
    backgroundColor: "#333"
  },
  css_input: {
    display: "inline-block",
    //position: "absolute",
    //bottom: "0",
    margin: "0",
    border: "none",
    outline: "none",
    padding: "inherit",
    width: "96%",
    backgroundColor: "transparent",
    color: "inherit",
    fontFamily: "inherit"
  },
  // erase box contents and append input
  clear: function(){
    this.box.innerHTML = "";
    this.box.appendChild(this.input);
    return this;
  },
  // set focus on input
  focus: function(){
    this.input.focus();
    return this;
  },
  // command history
  history: [],
  limit: 20,
  cursor: -1,
  prev: function(){
    if( this.cursor < 0 ){
      this.cursor = this.history.length;
    }
    this.cursor--;
    this.input.value = this.history[this.cursor] || "";
    return this;
  },
  next: function(){
    if( this.cursor >= this.history.length ){
      this.cursor = -1;
    }
    this.cursor++;
    this.input.value = this.history[this.cursor] || "";
    return this;
  },
  // connects to server
  connect: function( socket_url ){
    var self = this
      , status = this.logger('status', '')
    ;
    this.io = io.connect.apply( io, arguments )
      .on( 'connecting', status.bind(null, 'Connecting to server via') )
      .on( 'reconnecting', status.bind(null, 'Attemping to restore connection...') )
      .on( 'connect', status.bind(null, 'Successfully connected.') )
      .on( 'disconnect', status.bind(null, 'Disconected.') )
      //.on( 'connect_failed', this.error.bind(this, 'Could not connect to server') )
      .on( 'error', this.error.bind(this, 'Error from server:') )
      // logs from server are preceded with a section character
      .on( 'log', this.logger( 'log', '\u00A7 ' ) )
      // exec responses are preceded with an zig-zag arrow
      .on( 'response', function(cmd, res){
        self
          .write( "prompt", "\u21af " )
          .write( "response-cmd", cmd, "\n" )
          .write( "response-body", res, "\n" )
        ;
      })
    ;
    //this.io.socket.on( 'error' )
    return this;
  },
  // listens to an event on this.io
  on: function(){
    this.io.on.apply( this.io, arguments );
    return this;
  },
  // listens to an event once on this.io
  once: function(){
    this.io.once.apply( this.io, arguments );
    return this;
  },
  // emits an event on this.io
  emit: function(){
    this.io.emit.apply( this.io, arguments );
    return this;
  },
  // get a function to prompt values
  logger: function( classes, prompt ){
    var self = this;
    return function(){
      self
        .write( 'prompt', prompt !== undefined? prompt : self.prompt )
        .write( classes, Array.prototype.slice.call(arguments).join(' '), '\n' )
      ;
    }
  },
  // execute command value
  exec: function( command ){
    this.history.push( command )
    while( this.history.length > this.limit ){
      this.history.shift();
    }
    switch( command ){
      case "clear":
        return this.clear();
      default:
        //this.log( this.prompt, command );
        if( !this.io || !this.io.socket.connected ){
          return this.error("can't execute without connecting first");
        }
        return this.emit( 'execute', command );
    }
  },
  // sets current output styles
  style: function( css ){
    this.styles = css || {};
    return this;
  },
  // resets output styles
  reset: function(){
    return this.style({});
  },
  // shortcut tu change current output colors
  colors: function( fg, bg ){
    return this.style({
      color: fg,
      backgroundColor: bg
    });
  },
  // writes something on the box. Input's focus will be lost.
  write: function( classes, text1, to, textN ){
    var span = document.createElement('span');
    span.innerHTML = Array.prototype.slice.call(arguments, 1).join(" ");
    span.className = Array.isArray(classes)
      ? classes.join(" ")
      : classes && classes.toString() || ""
    ;
    WebShell.put( this.styles, span.style );

    this.box.appendChild( span );
    this.box.appendChild( this.input );
    this.box.scrollTop = this.box.scrollHeight;
    return this;
  },
  log: function( arg1, to, argN ){
    var text = Array.prototype.slice.call(arguments).join(" ");
    return this.write( 'log', text, '\n' );
  },
  error: function( err ){
    var message = err.stack
     ? err.stack.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    : Array.prototype.slice.call(arguments).join(' ')
    ;
    return this
      .colors('#d00')
      .write( 'error', message, '\n' )
      .reset()
    ;
  }
};

// Utility function to setup css styles
WebShell.put = function( from, where ){
  for( var key in from ){
    where[key] = from[key]
  };
};
