
var fs = require('fs')
var path = require('path')
var cheerio = require('cheerio')
var oop = require('iai-oop')

// View inherits from nothing for now. Maybe it becomes a stream?
// Could be awesome to pipe html sources into but it's senseless browser-side
var exports = module.exports = {}
// Prototype is the exported object. Make instanceof work
exports.constructor = View
exports.constructor.prototype = exports

// The View constructor
function View (source) {
  var instance = Object.create(exports.isPrototypeOf(this) ? this : exports)
  if (typeof source !== 'undefined') {
    // here we have multiple source options.
    // An string is always wellcome, but what if we want a fs.ReadableStream?
    // To make viable the asset api, an options object providing a dirname
    // should be neccessary, so assets are suposed to be there?
  }
  source = source || ''
  oop(instance)
    .visible('$', cheerio.load(source))
    .visible('block', Object.create(null))

  return instance
}

exports.toString = function () {
  return this.$.html()
}

exports.define = function (id, selector) {
  // TODO YAGNI is "delete" feature really need?
  if (selector === null) {
    delete this.block[id]
    return this
  }
  this.block[id] = this.$(selector)
  if (this.block[id].length !== 1) {
    throw Error('block selector "%s" should match 1 node', selector)
  }
  return this
}

exports.script
exports.styles
exports.assets

/**
 * The assets API is designed to allow external sources to be served at
 * development time. At production, seems a better idea to serve that sources
 * from the nginx you should be sitting in front of the node application at
 * port 80.
 *
 * Build operations should be easy to manage transversing the media map. The
 * media map is common to all view instances, that way it's guarantable that
 * defined URL's are unique system-wide.
 */

oop(exports).visible('media', Object.create(null))
exports.source = function (url, filename) {
  if (url === '/') {
    throw Error('cannot map a media source for "/" (root)')
  }
  if (this.media[url]) {
    log.warn('overrided media url "%s"')
  }
  this.media[url] = filename
  return this
}

/**
 * The built-in answer operation dispatchs HTTP requests as expected. Warns
 * will be emitted when NODE_ENV=production if an external source is served.
 *
 * External sources not being found at filesystem will produce a 500 response.
 *
 * TODO this logic fits better outside the view class. Maybe an operation
 *
 */
exports.answer = function (req, res) {
  // keep this intentionally simple. Middleware should not be a feature for
  // views, view.answer should be inserted on the router middleware chain.
  if (!exports.isPrototypeOf(this)) {
    // TODO this should produce a 500 response and keep the node process runing
    throw Error('expecting context to be instanceof View')
  }
  var filename = this.media[req.url]
  if (filename) {
    if (process.env.NODE_ENV === 'production') {
      log.warn('Serving an external source within a production environment')
    }
    return fs.createReadStream(filename)
      .on('open', function () {
        log.verb('Serve "%s" as media source "%s"', req.url, filename)
        res.statusCode = 200
        this.pipe(res)
      })
      .on('error', function (err) {
        log.error('Cannot serve media source "%s"', req.url)
        res.statusCode = 500
        if (err.code === 'ENOENT') {
          log.error('The file "%s" does not exist', filename)
        } else {
          log.error('Unexpected error while reading "%s"', filename)
          log.error(err.stack)
        }
        res.end()
      })
  }
  var views = this.resolve(req.url)
  var view = views.pop().obj // TODO resolve always gives this at [0]?
  while (views.length) {
    var child = views.pop()
    view.appendOn('HOWTHEFUCKTOKNOWTHEBLOCK', child.obj)
    view = child.obj
  }
  res.end(this.toString())
}

exports.html = function (src) {
  if (typeof src !== 'string') {
    throw TypeError('html source must be provided as string')
  }
  this.src = src
  this.$ = typeof window !== 'undefined' ? cheerio(src) : cheerio.load(src).root()
  return this
}

exports.html(fs.readFileSync(path.join(__dirname, 'default.html'), 'utf8'))
// <meta charset="utf8">

exports._assets = []
exports.assets = function (etc) {
  [].push.apply(this._assets, arguments)
  return this
}

exports.blocks = function (etc) {
  if (typeof etc === 'string') {
    return this.addBlock.apply(this, arguments)
  }
  for (var bid in etc) {
    this.addBlock(bid, etc[bid])
  }
  return this
}
exports.addBlock = function (bid, selector) {
  if (this._block[bid]) {
    throw new Error(this + ' already has a block with id ' + bid)
  }
  if (typeof selector !== 'string') {
    throw new TypeError('block selector must be a string')
  }
  this._block[ bid ] = selector
  return this
}
exports.getBlock = function (bid) {
  return this._block[ bid ]
}

exports.appendOn = function (blockid, view) {
  if (!blockid || !view) {
    console.log(Error().stack)
    throw ReferenceError('target selector and view must be provided')
  }
  if (!(view instanceof exports)) {
    throw TypeError('view must be provided as instanceof core/View')
  }
  if (!this._block[blockid]) {
    throw ReferenceError(this + ' does not have a block with id ' + blockid)
  }
  this.$block[ blockid ].append(view.$)
  return this
}

exports.views = function (etc) {
  if (typeof etc === 'string') {
    return this.addView.apply(this, arguments)
  }
  for (var vid in etc) {
    this.addView(vid, etc[vid].view)
  }
  return this
}
exports.addView = function (vid, bid, view) {
  if (this._view[vid]) {
    throw new Error(this + ' already has a view with id ' + vid)
  }
  if (!(view instanceof View)) {
    throw new TypeError(this + ' child view must be instanceof core/View')
  }
  this._view[ vid ] = view.id(vid)
  return this
}
exports.getView = function (vid) {
  return this._view[ vid ]
}

exports.resolve = function (url) {
  var parts = (url === '/') ? [] : url.split('/')
  var cumbs = []
  var view = this
  while (parts.length) {
    view = view.getView(parts.shift())
    if (!(view instanceof exports)) {
      throw new ReferenceError(this + ' cant resolve url ' + url)
    }
    cumbs.push(view)
    continue
    // TODO this should be pushed instead
    cumbs.push({
      ref: null, // the parts.shift() thing
      url: cumbs[cumbs.length - 1].url + '/' + 'name', // or "/"
      obj: view
    })
  }
  return cumbs
}

exports.handler = function defaultHandler (req, res) {
  // keep this intentionally simple and let other routing
  // frameworks do the job inserting them through exports.handle()
  if (!(this instanceof exports)) {
    throw new Error('expecting context to be instanceof View')
  }
  var views = this.resolve(req.url)
  while (views.length) {
    views.pop().appendOn('main', views[views.length - 1])
  }
  this.streamTo(res)
}

exports.handle = function (fn) {
  if (typeof fn !== 'function') {
    throw TypeError('request handler must be provided as function')
  }
  this.handler = fn.bind(this)
  return this
}

exports.ready = function defaultReady (window) {
  if (!(this instanceof exports)) {
    throw new Error('expecting context to be instanceof View')
  }
  if (typeof window === 'undefined' || !window.document) {
    throw new Error('expecting window and window.document to be defined')
  }
  if (this._id) {
    this.$ = $('#' + this._id)
  } else {
    this.$ = null
  }
  return this
}

exports.resize = function defaultAdjust (window) {
  if (!(this instanceof exports)) {
    throw new Error('expecting context to be instanceof View')
  }
  if (typeof window === 'undefined') {
    throw new Error('expecting window and window.document to be defined')
  }
  // TODO check assets are included
  return this
}
exports.adjust = function (fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('adjust (View.resize) must be provided as function')
  }
  this.resize = fn
  return this
}

exports.streamTo = function (writable) {
  return this
}
