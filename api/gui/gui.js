
var path = require('path');
var spawn = require('child_process').spawn;
//var electron = require('electron-prebuilt');
var EventEmitter = require('events').EventEmitter;
var BrowserWindowRemote = require('./BrowserWindowRemote');
var iai = require('iai-abc');
var log = iai.log;

var gui = module.exports = new EventEmitter;
var exports = iai.oop(gui);

// internal reference to the electron child process
var cp = null;

// controls the spawning of the child process running electron
// DO NOT START TWICE!! One child process is enought
exports.visible('start', function( url ){
  if( cp ){
    throw new Error('ALREADY STARTED MOTHERFUCKER');
  }
  log.verb('Will spawn the electron process now');
  cp = spawn('electron', [ path.join(__dirname, 'electron') ], {
    cwd: process.cwd(),
    env: process.env,
    stdio: [null, 'pipe', 'pipe', 'ipc']
  });
  // ensure electron is killed if process exits
  process.on( 'exit', cp.kill.bind(cp, 'SIGTERM') );
  // TODO YAGNI notify environment changes
  // requires implementing iai.process.env() 
  // process.on('env', function( key, val ){});

  // neccessary to see messages writen to stdX from electron process
  // TODO (YAGNI) option to change the streams to pipe cp.stdX to??
  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);

  // neccessary to receive messages from electron process (through ipc)
  cp.on( 'message', parseChildMessage )

  // TODO gui listening for itself seems not good
  // loadUrl should be a method and a window should be specified
  url && gui.on('app:ready', function(){
    cp.send({ control: 'win.loadURL', args: [url] });
  });

  return this;
});

// sends a message to the electron child process (through ipc)
exports.visible('send', function( msg ){
  if( !cp ){ throw new Error('START IT FIRST MOTHERFUCKER'); }
  cp.send( msg );
  return this;
});

var win = {}; // the Array machinery is not need to store windows by id
exports.visible('createWindow', function( options, callback ){
  return this.send({ window: options }).once('new-window', function( id ){
    win[id] = BrowserWindowRemote(id, cp);
    this.once('window:'+id+':closed', function(){
      win[id].emit('closed');
      delete win[id];
    });
    // shitty solution to emit the BrowserWindowRemote directly
    this.emit('window-created', win[id]);
  });
});
exports.visible('window', function( id ){
  return win[id];
});

function parseChildMessage( msg ){
  if( msg.emit ){
    log.verb( 'will emit "%s" %j', msg.emit, msg.data );
    return 'undefined' != typeof msg.data
      ? gui.emit(msg.emit, msg.data)
      : gui.emit(msg.emit)
    ;
  }
  log.warnf('cannot understand message %j', msg);
}
