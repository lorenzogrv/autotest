(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports = View

View.prototype = View
View.prototype.constructor = View

function View (id) {
  if (!id) {
    throw new Error('views must have an id')
  }
  // YAGNI!!
  if (View.cache[id]) {
    return View.cache[id]
  }

  var instance = Object.create(View)
  View.cache[id] = instance

  instance.id = id // TODO this data descriptor should be non-writable

  return instance
}

View.cache = Object.create(null) // TODO this should be a set?

View.toString = function () {
  // TODO this.id may be undefined
  return '<div id="' + this.id + '" class="view"></div>'
}

View.display = function () {
  if (this.$) {
    // TODO if i have a DOM element, it's already appended
    // HERE GOES "HIDE ALL VIEWS, SHOW THIS VIEW"
    alert('not implemented')
    return this
  }
  // no DOM element, let's append on body (with care)
  if (document.querySelector('#' + this.id) !== null) {
    alert('document id "' + this.id + '" already exists')
    throw new ReferenceError("can't duplicate id")
  }
  document.body.innerHTML += this // toString outputs HTML
  this.$ = document.querySelector('#' + this.id)
  return this
}

},{}],2:[function(require,module,exports){
const { EventEmitter } = require('events')
const sock = require('./wsocket.js')

var command = module.exports = new EventEmitter()

command.execute = function command (cmdline) {
  try {
    command.run(cmdline)
  } catch (err) {
    this.emit('stdout', err.stack)
    this.emit('stdout', 'an error raised when running: ' + cmdline)
  }
}
command.run = function run (cmdline) {
  var argv = cmdline.split(' ')
  var cmd = argv.shift()
  if (typeof command[cmd] !== 'function') {
    return this.emit('stdout', 'Error: command not found: ' + cmd)
  }
  command[cmd].apply(this, argv)
}
command.echo = function echo () {
  this.emit('stdout', Array.prototype.slice.call(arguments).join(' '))
}
// TODO not sure if sock.send should be called from here
command.ping = function ping () {
  sock.send('ping')
}
command.exit = function exit () {
  this.emit('stdout', 'EXIT request from server')
  this.emit('stdout', 'Closing window in 2 sec')
  return setTimeout(window.close.bind(window), 2000)
}
command.stdin = function stdin (key) {
  this.emit('stdin', key)
}
command.reload = function reload () {
  window.location.reload()
}

},{"./wsocket.js":3,"events":5}],3:[function(require,module,exports){
const { EventEmitter } = require('events')

const sock = module.exports = new EventEmitter()

// TODO document may not exist on non-browser environment
sock.uri = 'ws://' + document.location.host

sock.ws = null

sock.connect = function () {
  var sock = this
  if (sock.ws) {
    sock.emit('message', 'websocket already connected!')
    return sock.ws.close()
  }
  sock.emit('message', 'connecting to ' + sock.uri)
  sock.ws = new WebSocket(sock.uri)
  sock.ws.onopen = sock.onopen.bind(sock)
  sock.ws.onerror = sock.onerror.bind(sock)
  sock.ws.onclose = sock.onclose.bind(sock)
  sock.ws.onmessage = sock.onmessage.bind(sock)
}

// Websocket event handlers
sock.onopen = function (event) {
  this.emit('message', 'websocket opened')
}
sock.onerror = function (event) {
  this.emit('message', 'could not open websocket')
}
sock.onclose = function (event) {
  this.emit('message', 'websocket disconected.')
  this.ws = null

  var t = 5
  setTimeout(this.connect.bind(this), t * 1000 + 1)
  var sock = this
  var i = setInterval(function () {
    sock.emit('message', 'reconnecting in ' + t)
    if (!--t) clearInterval(i)
  }, 1000)
}
sock.onmessage = function (event) {
  // TODO just now, shoud re-think the whole thing
  this.emit('command', event.data)
}
// this is just a quick-n-dirty way to get it working now
sock.send = function () {
  this.ws.send.apply(this.ws, arguments)
  return this
}

},{"events":5}],4:[function(require,module,exports){

const sock = require('./wsocket')
const command = require('./command')

const View = require('./View')

// DOM elements
var inh1 = null
var view = null

function message (str) {
  view.innerHTML = str + '\n' + view.innerHTML
}

function keypress (key) {
  if (key.length === 1) {
    inh1.innerHTML += key
    return
  }
  switch (key) {
    case 'Space':
      inh1.innerHTML += ' '
      break
    case 'Backspace':
      inh1.innerHTML = inh1.innerHTML.slice(0, -1)
      break
    case 'Enter':
      command.run(inh1.innerHTML)
      inh1.innerHTML = ''
      break
    default:
      this.emit('stdout', 'unbound key: ' + key)
  }
}

command
  .on('stdin', keypress)
  .on('stdout', message)

sock
  .on('message', message)
  .on('command', function (cmdline) {
    try {
      command.run(cmdline)
    } catch (err) {
      message(err.stack)
      message('an error raised when running: ' + cmdline)
    }
  })

// TODO use https://github.com/cms/domready/blob/master/domready.js
document.addEventListener('DOMContentLoaded', function () {
  var terminal = View('terminal')
  terminal.toString = function () {
    return View.toString.call(this) + '<h1 id="stdin"></h1>'
  }
  terminal.display()

  view = document.querySelector('#terminal')
  inh1 = document.querySelector('#stdin')

  sock.connect()

  document.querySelector('#main_action').onclick = function () {
    sock.send('main action click')
  }
})

},{"./View":1,"./command":2,"./wsocket":3}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJicm93c2VyL1ZpZXcuanMiLCJicm93c2VyL2NvbW1hbmQuanMiLCJicm93c2VyL3dzb2NrZXQuanMiLCJicm93c2VyIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbm1vZHVsZS5leHBvcnRzID0gVmlld1xuXG5WaWV3LnByb3RvdHlwZSA9IFZpZXdcblZpZXcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVmlld1xuXG5mdW5jdGlvbiBWaWV3IChpZCkge1xuICBpZiAoIWlkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd2aWV3cyBtdXN0IGhhdmUgYW4gaWQnKVxuICB9XG4gIC8vIFlBR05JISFcbiAgaWYgKFZpZXcuY2FjaGVbaWRdKSB7XG4gICAgcmV0dXJuIFZpZXcuY2FjaGVbaWRdXG4gIH1cblxuICB2YXIgaW5zdGFuY2UgPSBPYmplY3QuY3JlYXRlKFZpZXcpXG4gIFZpZXcuY2FjaGVbaWRdID0gaW5zdGFuY2VcblxuICBpbnN0YW5jZS5pZCA9IGlkIC8vIFRPRE8gdGhpcyBkYXRhIGRlc2NyaXB0b3Igc2hvdWxkIGJlIG5vbi13cml0YWJsZVxuXG4gIHJldHVybiBpbnN0YW5jZVxufVxuXG5WaWV3LmNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKSAvLyBUT0RPIHRoaXMgc2hvdWxkIGJlIGEgc2V0P1xuXG5WaWV3LnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAvLyBUT0RPIHRoaXMuaWQgbWF5IGJlIHVuZGVmaW5lZFxuICByZXR1cm4gJzxkaXYgaWQ9XCInICsgdGhpcy5pZCArICdcIiBjbGFzcz1cInZpZXdcIj48L2Rpdj4nXG59XG5cblZpZXcuZGlzcGxheSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuJCkge1xuICAgIC8vIFRPRE8gaWYgaSBoYXZlIGEgRE9NIGVsZW1lbnQsIGl0J3MgYWxyZWFkeSBhcHBlbmRlZFxuICAgIC8vIEhFUkUgR09FUyBcIkhJREUgQUxMIFZJRVdTLCBTSE9XIFRISVMgVklFV1wiXG4gICAgYWxlcnQoJ25vdCBpbXBsZW1lbnRlZCcpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICAvLyBubyBET00gZWxlbWVudCwgbGV0J3MgYXBwZW5kIG9uIGJvZHkgKHdpdGggY2FyZSlcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyMnICsgdGhpcy5pZCkgIT09IG51bGwpIHtcbiAgICBhbGVydCgnZG9jdW1lbnQgaWQgXCInICsgdGhpcy5pZCArICdcIiBhbHJlYWR5IGV4aXN0cycpXG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiY2FuJ3QgZHVwbGljYXRlIGlkXCIpXG4gIH1cbiAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgKz0gdGhpcyAvLyB0b1N0cmluZyBvdXRwdXRzIEhUTUxcbiAgdGhpcy4kID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignIycgKyB0aGlzLmlkKVxuICByZXR1cm4gdGhpc1xufVxuIiwiY29uc3QgeyBFdmVudEVtaXR0ZXIgfSA9IHJlcXVpcmUoJ2V2ZW50cycpXG5jb25zdCBzb2NrID0gcmVxdWlyZSgnLi93c29ja2V0LmpzJylcblxudmFyIGNvbW1hbmQgPSBtb2R1bGUuZXhwb3J0cyA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5jb21tYW5kLmV4ZWN1dGUgPSBmdW5jdGlvbiBjb21tYW5kIChjbWRsaW5lKSB7XG4gIHRyeSB7XG4gICAgY29tbWFuZC5ydW4oY21kbGluZSlcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhpcy5lbWl0KCdzdGRvdXQnLCBlcnIuc3RhY2spXG4gICAgdGhpcy5lbWl0KCdzdGRvdXQnLCAnYW4gZXJyb3IgcmFpc2VkIHdoZW4gcnVubmluZzogJyArIGNtZGxpbmUpXG4gIH1cbn1cbmNvbW1hbmQucnVuID0gZnVuY3Rpb24gcnVuIChjbWRsaW5lKSB7XG4gIHZhciBhcmd2ID0gY21kbGluZS5zcGxpdCgnICcpXG4gIHZhciBjbWQgPSBhcmd2LnNoaWZ0KClcbiAgaWYgKHR5cGVvZiBjb21tYW5kW2NtZF0gIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0KCdzdGRvdXQnLCAnRXJyb3I6IGNvbW1hbmQgbm90IGZvdW5kOiAnICsgY21kKVxuICB9XG4gIGNvbW1hbmRbY21kXS5hcHBseSh0aGlzLCBhcmd2KVxufVxuY29tbWFuZC5lY2hvID0gZnVuY3Rpb24gZWNobyAoKSB7XG4gIHRoaXMuZW1pdCgnc3Rkb3V0JywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKCcgJykpXG59XG4vLyBUT0RPIG5vdCBzdXJlIGlmIHNvY2suc2VuZCBzaG91bGQgYmUgY2FsbGVkIGZyb20gaGVyZVxuY29tbWFuZC5waW5nID0gZnVuY3Rpb24gcGluZyAoKSB7XG4gIHNvY2suc2VuZCgncGluZycpXG59XG5jb21tYW5kLmV4aXQgPSBmdW5jdGlvbiBleGl0ICgpIHtcbiAgdGhpcy5lbWl0KCdzdGRvdXQnLCAnRVhJVCByZXF1ZXN0IGZyb20gc2VydmVyJylcbiAgdGhpcy5lbWl0KCdzdGRvdXQnLCAnQ2xvc2luZyB3aW5kb3cgaW4gMiBzZWMnKVxuICByZXR1cm4gc2V0VGltZW91dCh3aW5kb3cuY2xvc2UuYmluZCh3aW5kb3cpLCAyMDAwKVxufVxuY29tbWFuZC5zdGRpbiA9IGZ1bmN0aW9uIHN0ZGluIChrZXkpIHtcbiAgdGhpcy5lbWl0KCdzdGRpbicsIGtleSlcbn1cbmNvbW1hbmQucmVsb2FkID0gZnVuY3Rpb24gcmVsb2FkICgpIHtcbiAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG59XG4iLCJjb25zdCB7IEV2ZW50RW1pdHRlciB9ID0gcmVxdWlyZSgnZXZlbnRzJylcblxuY29uc3Qgc29jayA9IG1vZHVsZS5leHBvcnRzID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbi8vIFRPRE8gZG9jdW1lbnQgbWF5IG5vdCBleGlzdCBvbiBub24tYnJvd3NlciBlbnZpcm9ubWVudFxuc29jay51cmkgPSAnd3M6Ly8nICsgZG9jdW1lbnQubG9jYXRpb24uaG9zdFxuXG5zb2NrLndzID0gbnVsbFxuXG5zb2NrLmNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzb2NrID0gdGhpc1xuICBpZiAoc29jay53cykge1xuICAgIHNvY2suZW1pdCgnbWVzc2FnZScsICd3ZWJzb2NrZXQgYWxyZWFkeSBjb25uZWN0ZWQhJylcbiAgICByZXR1cm4gc29jay53cy5jbG9zZSgpXG4gIH1cbiAgc29jay5lbWl0KCdtZXNzYWdlJywgJ2Nvbm5lY3RpbmcgdG8gJyArIHNvY2sudXJpKVxuICBzb2NrLndzID0gbmV3IFdlYlNvY2tldChzb2NrLnVyaSlcbiAgc29jay53cy5vbm9wZW4gPSBzb2NrLm9ub3Blbi5iaW5kKHNvY2spXG4gIHNvY2sud3Mub25lcnJvciA9IHNvY2sub25lcnJvci5iaW5kKHNvY2spXG4gIHNvY2sud3Mub25jbG9zZSA9IHNvY2sub25jbG9zZS5iaW5kKHNvY2spXG4gIHNvY2sud3Mub25tZXNzYWdlID0gc29jay5vbm1lc3NhZ2UuYmluZChzb2NrKVxufVxuXG4vLyBXZWJzb2NrZXQgZXZlbnQgaGFuZGxlcnNcbnNvY2sub25vcGVuID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIHRoaXMuZW1pdCgnbWVzc2FnZScsICd3ZWJzb2NrZXQgb3BlbmVkJylcbn1cbnNvY2sub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xuICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCAnY291bGQgbm90IG9wZW4gd2Vic29ja2V0Jylcbn1cbnNvY2sub25jbG9zZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCAnd2Vic29ja2V0IGRpc2NvbmVjdGVkLicpXG4gIHRoaXMud3MgPSBudWxsXG5cbiAgdmFyIHQgPSA1XG4gIHNldFRpbWVvdXQodGhpcy5jb25uZWN0LmJpbmQodGhpcyksIHQgKiAxMDAwICsgMSlcbiAgdmFyIHNvY2sgPSB0aGlzXG4gIHZhciBpID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgIHNvY2suZW1pdCgnbWVzc2FnZScsICdyZWNvbm5lY3RpbmcgaW4gJyArIHQpXG4gICAgaWYgKCEtLXQpIGNsZWFySW50ZXJ2YWwoaSlcbiAgfSwgMTAwMClcbn1cbnNvY2sub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIC8vIFRPRE8ganVzdCBub3csIHNob3VkIHJlLXRoaW5rIHRoZSB3aG9sZSB0aGluZ1xuICB0aGlzLmVtaXQoJ2NvbW1hbmQnLCBldmVudC5kYXRhKVxufVxuLy8gdGhpcyBpcyBqdXN0IGEgcXVpY2stbi1kaXJ0eSB3YXkgdG8gZ2V0IGl0IHdvcmtpbmcgbm93XG5zb2NrLnNlbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMud3Muc2VuZC5hcHBseSh0aGlzLndzLCBhcmd1bWVudHMpXG4gIHJldHVybiB0aGlzXG59XG4iLCJcbmNvbnN0IHNvY2sgPSByZXF1aXJlKCcuL3dzb2NrZXQnKVxuY29uc3QgY29tbWFuZCA9IHJlcXVpcmUoJy4vY29tbWFuZCcpXG5cbmNvbnN0IFZpZXcgPSByZXF1aXJlKCcuL1ZpZXcnKVxuXG4vLyBET00gZWxlbWVudHNcbnZhciBpbmgxID0gbnVsbFxudmFyIHZpZXcgPSBudWxsXG5cbmZ1bmN0aW9uIG1lc3NhZ2UgKHN0cikge1xuICB2aWV3LmlubmVySFRNTCA9IHN0ciArICdcXG4nICsgdmlldy5pbm5lckhUTUxcbn1cblxuZnVuY3Rpb24ga2V5cHJlc3MgKGtleSkge1xuICBpZiAoa2V5Lmxlbmd0aCA9PT0gMSkge1xuICAgIGluaDEuaW5uZXJIVE1MICs9IGtleVxuICAgIHJldHVyblxuICB9XG4gIHN3aXRjaCAoa2V5KSB7XG4gICAgY2FzZSAnU3BhY2UnOlxuICAgICAgaW5oMS5pbm5lckhUTUwgKz0gJyAnXG4gICAgICBicmVha1xuICAgIGNhc2UgJ0JhY2tzcGFjZSc6XG4gICAgICBpbmgxLmlubmVySFRNTCA9IGluaDEuaW5uZXJIVE1MLnNsaWNlKDAsIC0xKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdFbnRlcic6XG4gICAgICBjb21tYW5kLnJ1bihpbmgxLmlubmVySFRNTClcbiAgICAgIGluaDEuaW5uZXJIVE1MID0gJydcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXMuZW1pdCgnc3Rkb3V0JywgJ3VuYm91bmQga2V5OiAnICsga2V5KVxuICB9XG59XG5cbmNvbW1hbmRcbiAgLm9uKCdzdGRpbicsIGtleXByZXNzKVxuICAub24oJ3N0ZG91dCcsIG1lc3NhZ2UpXG5cbnNvY2tcbiAgLm9uKCdtZXNzYWdlJywgbWVzc2FnZSlcbiAgLm9uKCdjb21tYW5kJywgZnVuY3Rpb24gKGNtZGxpbmUpIHtcbiAgICB0cnkge1xuICAgICAgY29tbWFuZC5ydW4oY21kbGluZSlcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIG1lc3NhZ2UoZXJyLnN0YWNrKVxuICAgICAgbWVzc2FnZSgnYW4gZXJyb3IgcmFpc2VkIHdoZW4gcnVubmluZzogJyArIGNtZGxpbmUpXG4gICAgfVxuICB9KVxuXG4vLyBUT0RPIHVzZSBodHRwczovL2dpdGh1Yi5jb20vY21zL2RvbXJlYWR5L2Jsb2IvbWFzdGVyL2RvbXJlYWR5LmpzXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICB2YXIgdGVybWluYWwgPSBWaWV3KCd0ZXJtaW5hbCcpXG4gIHRlcm1pbmFsLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBWaWV3LnRvU3RyaW5nLmNhbGwodGhpcykgKyAnPGgxIGlkPVwic3RkaW5cIj48L2gxPidcbiAgfVxuICB0ZXJtaW5hbC5kaXNwbGF5KClcblxuICB2aWV3ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Rlcm1pbmFsJylcbiAgaW5oMSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzdGRpbicpXG5cbiAgc29jay5jb25uZWN0KClcblxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbl9hY3Rpb24nKS5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHNvY2suc2VuZCgnbWFpbiBhY3Rpb24gY2xpY2snKVxuICB9XG59KVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4gKCcgKyBlciArICcpJyk7XG4gICAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGV2bGlzdGVuZXIpKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoZXZsaXN0ZW5lcilcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gMDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIl19
