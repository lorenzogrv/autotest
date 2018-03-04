//'use strict';

const iai = require('../../..'); // TODO that dots hurt my eyes
const log = iai.log;

log.info('started the electron based iai-gui');
log.info('process.send support is', process.send? 'enabled' : 'disabled');
// TODO if process.send is undefined, throw and exit inmediately

const electron = require('electron');
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Module to control application life.
const app = electron.app;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

const control = { app: app, win: { count: 0 } };
// see at bottom the function
process.on('message', parseParentMessage);


// Quit when all windows are closed.
app.on('window-all-closed', function() {
  process.send({ emit: 'app:window-all-closed' });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // screen retrieves info about screen size, displays, cursor position, etc.
  // @see https://github.com/electron/electron/blob/master/docs/api/screen.md
  var screen = electron.screen;
  process.send({
    emit: 'screen',
    data: {
      all: screen.getAllDisplays(),
      cursor: screen.getCursorScreenPoint(),
      primary: screen.getPrimaryDisplay()
    }
  });
  // TODO care with display rearrangement
  /*screen
    .on('display-added', function(event, newDisplay){})
    .on('display-removed', function(event, oldDisplay){})
    .on('display-metrics-changed', function(event, display, changedMetrics){})
    ;*/

  // notify the app is ready
  process.send({ emit: 'app:ready' });
});

// commands electron from the main node.js process
function parseParentMessage( msg ){
  // TODO REFACTOR commands received should be either simpler or decoupled with
  // a better pattern so this function stays clean
  if( msg.control ){
    msg.args = msg.args || [];
    log.verb( 'control command %s %j', msg.control, msg.args );

    try {
      // TODO this logicshould belong to iai-oop => oop(control).exec( ... )
      if( !Array.isArray(msg.args) ){
        throw new TypeError('"args" - when present - must be an array.');
      }
      var refs = msg.control.split('.');
      var operation = control;
      var ref, value = operation;
      while( ref = refs.shift() ){
        var reason = false;
        if( value[ref] === null ){ reason = 'null'; }
        if( 'undefined' == typeof value[ref] ){ reason = 'undefined'; }
        if( reason ){
          throw new Error( value + "'s property '" + ref + "' is " + reason );
        }
        operation = value
        value = value[ ref ];
      }
      if( 'function' !== typeof value ){
        throw new Error( "This operation is not a function: " + msg.control );
      }
      return value.apply( operation, msg.args );
    } catch (e) {
      log.fatal('exception thrown by command %s, %j', msg.control, msg.args);
      throw e;
    }
  }
  if( msg.window ){
    log.verb('(new) window command %j', msg.window);
    // Create the browser window, store it for later use
    var id = control.win.count++;
    var win = control.win[id] = new BrowserWindow( msg.window );
    log.info('created new window with id %d', id);

    win
      // Dereference the window object when the window is closed
      .on('closed', function() {
        delete control.win[id];
        process.send({ emit: 'window:'+id+':closed' });
      })
      win.on('maximize', function(){
        process.send({ emit: 'window:'+id+':maximize' });
      })
    ;

    // TODO YAGNI
    // option to open the DevTools.
    //win.webContents.openDevTools();
    //option to loadURL
    //win.loadURL( 'file://' + iai.path.to('api/gui/electron/index.html') );
    //win.show();
    var t = null;
    win.on('move', function(){
      clearTimeout(t);
      t = setTimeout(function timeout(){
        log.verb( 'window %d has moved to %j', id, win.getBounds() );
      }, 1000);
    });
    return process.send({ emit: 'new-window', data: id })
  }
  log.warn('cant understand message %j', msg);
}
