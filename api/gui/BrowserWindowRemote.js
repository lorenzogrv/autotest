//
// The BrowserWindowRemote objects are intended to remotelly
// control a browser window at the electron process from the iai process
// @see https://github.com/electron/electron/blob/master/docs/api/browser-window.md

var EventEmitter = require('events').EventEmitter;
var oop = require('iai-oop');

module.exports = BrowserWindowRemote;
module.exports.prototype = Object.create(EventEmitter.prototype);
module.exports.prototype.constructor = module.exports;

// this is the constructor 
function BrowserWindowRemote(id, cp){
  // TODO here should be the instanceof check
  var instance = Object.create(this.prototype || module.exports.prototype);
  EventEmitter.call(instance);
  oop(instance)
    .visible( 'id', id )
    .hidden( 'cp', cp )
    .visible( 'remoteCall', function( method, args ){
      cp.send({ control: 'win.'+id+'.'+method, args: args });
      return instance;
    })
  ;
  return instance;
}

var exports = oop( module.exports.prototype );
var names = [
  "destroy", "close",
  "focus", "blur", "isFocused",
  "show", "showInactive", "hide", "isVisible",
  "maximize", "unmaximize", "isMaximized",
  "minimize", "restore", "isMinimized",
  "setFullScreen", "isFullScreen",
  "setBounds", "getBounds", "setSize", "getSize",
  "setContentSize", "getContentSize",
  "setMinimumSize", "getMinimumSize",
  "setMaximumSize", "getMaximumSize",
  "setResizable", "isResizable",
  "setFullScreenable", "isFullScreenable",
  "setAlwaysOnTop", "isAlwaysOnTop",
  "center", "setPosition", "getPosition",
  "setTitle", "getTitle", "flashFrame",
  "setSkipTaskbar", "setKiosk", "isKiosk",
  "lots of more methods, see electron docs"
];

// TODO YAGNI
// for method in names
function sendWindowControlCommand( ){
  this.remoteCall( method, [].slice.call(arguments, 0) );
}

exports.set('loadURL', function( uri ){
  return this.remoteCall('loadURL', [ uri ]);
});

exports.set('openDevTools', function( ){
  return this.remoteCall('webContents.openDevTools', []);
});

