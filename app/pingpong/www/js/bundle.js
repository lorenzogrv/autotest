(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var wsHost = 'ws://' + document.location.host
var ws = null

// DOM elements
var inh1 = null
var view = null

function message (str) {
  view.innerHTML = str + '\n' + view.innerHTML
}

function connect (callback) {
  if (ws) {
    message('reconnecting web socket...')
    ws.onclose = connect
    return ws.close()
  }
  message('connecting web socket to ' + wsHost)
  ws = new WebSocket(wsHost)

  ws.onopen = function (event) {
    message('websocket opened')
  }
  ws.onerror = function (err) {
    message('could not open websocket')
    message(err.stack || err.message || err)
  }
  ws.onclose = function (event) {
    message('websocket disconected')
  }
  ws.onmessage = function (event) {
    command(event.data)
  }
}

function command (cmdline) {
  try {
    command.run(cmdline)
  } catch (err) {
    message(err.stack)
    message('an error raised when running: ' + cmdline)
  }
}
command.run = function run (cmdline) {
  var argv = cmdline.split(' ')
  var cmd = argv.shift()
  if (typeof command[cmd] !== 'function') {
    return message('Error: command not found: ' + cmd)
  }
  command[cmd].apply(this, argv)
}
command.echo = function echo () {
  message(Array.prototype.slice.call(arguments).join(' '))
}
command.exit = function exit () {
  message('EXIT request from server')
  message('Closing window in 2 sec')
  return setTimeout(window.close.bind(window), 2000)
}
command.stdin = function stdin (key) {
  switch (key) {
    case 'Backspace':
      inh1.innerHTML = inh1.innerHTML.slice(0, -1)
      break
    case 'Enter':
      command(inh1.innerHTML)
      inh1.innerHTML = ''
      break
    default:
      if (key === 'Space') key = ' '
      inh1.innerHTML = inh1.innerHTML + key
  }
}

// TODO use https://github.com/cms/domready/blob/master/domready.js
document.addEventListener('DOMContentLoaded', function () {
  view = document.querySelector('#terminal')
  inh1 = document.querySelector('#stdin')
  connect()
  document.querySelector('#ping').onclick = function () {
    ws.send('ping')
  }
  document.querySelector('#main_action').onclick = function () {
    ws.send('main action click')
  }
  var input = document.querySelector('#input')
  document.querySelector('#send').onclick = function () {
    var msg = input.value
    msg ? ws.send(msg) : message('nothing to send! ')
  }
})

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJicm93c2VyIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxudmFyIHdzSG9zdCA9ICd3czovLycgKyBkb2N1bWVudC5sb2NhdGlvbi5ob3N0XG52YXIgd3MgPSBudWxsXG5cbi8vIERPTSBlbGVtZW50c1xudmFyIGluaDEgPSBudWxsXG52YXIgdmlldyA9IG51bGxcblxuZnVuY3Rpb24gbWVzc2FnZSAoc3RyKSB7XG4gIHZpZXcuaW5uZXJIVE1MID0gc3RyICsgJ1xcbicgKyB2aWV3LmlubmVySFRNTFxufVxuXG5mdW5jdGlvbiBjb25uZWN0IChjYWxsYmFjaykge1xuICBpZiAod3MpIHtcbiAgICBtZXNzYWdlKCdyZWNvbm5lY3Rpbmcgd2ViIHNvY2tldC4uLicpXG4gICAgd3Mub25jbG9zZSA9IGNvbm5lY3RcbiAgICByZXR1cm4gd3MuY2xvc2UoKVxuICB9XG4gIG1lc3NhZ2UoJ2Nvbm5lY3Rpbmcgd2ViIHNvY2tldCB0byAnICsgd3NIb3N0KVxuICB3cyA9IG5ldyBXZWJTb2NrZXQod3NIb3N0KVxuXG4gIHdzLm9ub3BlbiA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIG1lc3NhZ2UoJ3dlYnNvY2tldCBvcGVuZWQnKVxuICB9XG4gIHdzLm9uZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgbWVzc2FnZSgnY291bGQgbm90IG9wZW4gd2Vic29ja2V0JylcbiAgICBtZXNzYWdlKGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSB8fCBlcnIpXG4gIH1cbiAgd3Mub25jbG9zZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIG1lc3NhZ2UoJ3dlYnNvY2tldCBkaXNjb25lY3RlZCcpXG4gIH1cbiAgd3Mub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgY29tbWFuZChldmVudC5kYXRhKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNvbW1hbmQgKGNtZGxpbmUpIHtcbiAgdHJ5IHtcbiAgICBjb21tYW5kLnJ1bihjbWRsaW5lKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBtZXNzYWdlKGVyci5zdGFjaylcbiAgICBtZXNzYWdlKCdhbiBlcnJvciByYWlzZWQgd2hlbiBydW5uaW5nOiAnICsgY21kbGluZSlcbiAgfVxufVxuY29tbWFuZC5ydW4gPSBmdW5jdGlvbiBydW4gKGNtZGxpbmUpIHtcbiAgdmFyIGFyZ3YgPSBjbWRsaW5lLnNwbGl0KCcgJylcbiAgdmFyIGNtZCA9IGFyZ3Yuc2hpZnQoKVxuICBpZiAodHlwZW9mIGNvbW1hbmRbY21kXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBtZXNzYWdlKCdFcnJvcjogY29tbWFuZCBub3QgZm91bmQ6ICcgKyBjbWQpXG4gIH1cbiAgY29tbWFuZFtjbWRdLmFwcGx5KHRoaXMsIGFyZ3YpXG59XG5jb21tYW5kLmVjaG8gPSBmdW5jdGlvbiBlY2hvICgpIHtcbiAgbWVzc2FnZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oJyAnKSlcbn1cbmNvbW1hbmQuZXhpdCA9IGZ1bmN0aW9uIGV4aXQgKCkge1xuICBtZXNzYWdlKCdFWElUIHJlcXVlc3QgZnJvbSBzZXJ2ZXInKVxuICBtZXNzYWdlKCdDbG9zaW5nIHdpbmRvdyBpbiAyIHNlYycpXG4gIHJldHVybiBzZXRUaW1lb3V0KHdpbmRvdy5jbG9zZS5iaW5kKHdpbmRvdyksIDIwMDApXG59XG5jb21tYW5kLnN0ZGluID0gZnVuY3Rpb24gc3RkaW4gKGtleSkge1xuICBzd2l0Y2ggKGtleSkge1xuICAgIGNhc2UgJ0JhY2tzcGFjZSc6XG4gICAgICBpbmgxLmlubmVySFRNTCA9IGluaDEuaW5uZXJIVE1MLnNsaWNlKDAsIC0xKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdFbnRlcic6XG4gICAgICBjb21tYW5kKGluaDEuaW5uZXJIVE1MKVxuICAgICAgaW5oMS5pbm5lckhUTUwgPSAnJ1xuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKGtleSA9PT0gJ1NwYWNlJykga2V5ID0gJyAnXG4gICAgICBpbmgxLmlubmVySFRNTCA9IGluaDEuaW5uZXJIVE1MICsga2V5XG4gIH1cbn1cblxuLy8gVE9ETyB1c2UgaHR0cHM6Ly9naXRodWIuY29tL2Ntcy9kb21yZWFkeS9ibG9iL21hc3Rlci9kb21yZWFkeS5qc1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgdmlldyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0ZXJtaW5hbCcpXG4gIGluaDEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc3RkaW4nKVxuICBjb25uZWN0KClcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BpbmcnKS5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHdzLnNlbmQoJ3BpbmcnKVxuICB9XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluX2FjdGlvbicpLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgd3Muc2VuZCgnbWFpbiBhY3Rpb24gY2xpY2snKVxuICB9XG4gIHZhciBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbnB1dCcpXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZW5kJykub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbXNnID0gaW5wdXQudmFsdWVcbiAgICBtc2cgPyB3cy5zZW5kKG1zZykgOiBtZXNzYWdlKCdub3RoaW5nIHRvIHNlbmQhICcpXG4gIH1cbn0pXG4iXX0=
