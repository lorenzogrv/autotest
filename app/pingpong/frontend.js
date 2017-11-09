
var host = document.location.host.replace(/:[^:]*$/, '');
var wsHost = 'ws://' + host + ':27780';
var ws = null;
var view = null;

function message( str ){
  view.innerHTML = str + '\n' + view.innerHTML;
}

function connect( callback ){
  if( ws ){
    message('reconnecting web socket...');
    ws.onclose = connect;
    return ws.close();
  }
  message('connecting web socket to '+wsHost);
  ws = new WebSocket( wsHost );

  ws.onopen = function (event) {
    message('websocket opened');
  };
  ws.onerror = function( err ){
    message('could not open websocket');
  };
  ws.onclose= function( event ){
    message('websocket disconected');
  };
  ws.onmessage = function (event) {
    if( event.data == 'exit' ){
      message( 'EXIT request from server' );
      message( 'Closing window in 1 sec' );
      return setTimeout( window.close.bind(window), 1000 );
    }
    message( event.data );
  };
}

// TODO use https://github.com/cms/domready/blob/master/domready.js
document.addEventListener('DOMContentLoaded', function(){
  view = document.querySelector('#view');
  connect();
  document.querySelector('#ping').onclick = function(){
    ws.send('ping');
  };
  var input = document.querySelector('#input');
  document.querySelector('#send').onclick = function(){
    var msg = input.value;
    msg? ws.send( msg ) : message('nothing to send! ');
  };
});
