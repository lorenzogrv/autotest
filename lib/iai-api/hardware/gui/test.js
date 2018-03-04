var gui = require('./');

gui.start()
  .on('screen', function(displays){
    //for( var i in displays.all )
    // create a window on each display
    console.log(displays.primary);
    gui.createWindow({
      show: true,
      x: displays.primary.workArea.x,
      y: displays.primary.workArea.y,
      width: displays.primary.workArea.width,
      height: displays.primary.workArea.height
    }).once('window-created', function( window ){
      window.loadURL('file://'+__dirname+'/electron/index.html');
    });
  })
  .on('app:window-all-closed', function(){
    console.log('all windows closed. Will exit.');
    process.exit();
  })
;

