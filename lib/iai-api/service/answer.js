const fs = require('fs')
const abc = require('iai-abc')
const log = abc.log

//log.level = abc.Log.VERB

// EXPOSED OBJ
var answer = module.exports = {}

// There is NO next function here as answers ARE NOT middleware

// creates a request handler to serve file "as-is"
answer.File = function (file) {
  return (req, res) => fs.createReadStream(file).pipe(res)
}

// creates a request handler to answer a 404 Not Found response
answer.NotFound = function (opts) {
  // TODO opts needed? don't like the res.end(...)
  return function (req, res) {
    res.writeHead(404, {
      'Connection': 'close',
      'Content-Type': 'text/plain'
    })
    res.end('url not found: ' + req.url)
  }
}

// creates a request handler to route requests based on url
answer.Router = function (opts) {
  opts = opts || {}
  const urls = opts.urls || {}
  // TODO convert urls to a suitable object (reusable regexps)
  // TODO in urls there may be regexps (string starts with ^)
  if (opts.www) {
    // opts.www automatically adds url handlers for static assets
    require('child_process')
      // it's assumed any Router is created during bootstrap, so spawnSync is ok
      .spawnSync('find', [opts.www, '-type', 'f'])
      // convert output from find to an array of file paths
      .stdout.toString('utf8').split('\n').filter((file) => !!file)
      .forEach((file) => {
        // TODO if url already exists, throw Error
        urls[file.slice(opts.www.length)] = answer.File(file)
      })
    if (!urls['/'] && urls['/index.html']) {
      // remap /index.html to /
      urls['/'] = urls['/index.html']
      delete urls['/index.html']
    }
  }
  if (opts.menu && opts.ui) {
    // opts.menu automatically adds url handlers for given section hierarchy
    log.warn('experimental menu bind based on %s', opts.menu)
    opts.menu.descendants().forEach(function (section) {
      // TODO if section.url already in urls¿? !!!
      urls[section.url] = answer.Section(opts.ui, section)
    })
    // TODO opts.root => redirect '/' to given url (value from opts.root)
  }
  // TODO YAGNI opts.NotFound
  const NotFound = answer.NotFound()
  log.info('Created Router answer (%s urls total)', Object.keys(urls).length)
  log.verb('Created Router answer %o', Object.keys(urls))
  return function handle (req, res) {
    if (typeof urls[req.url] === 'function') {
      return urls[req.url](req, res)
    }
    return NotFound(req, res)
  }
}

// creates a request handler to write given object as JSON string
answer.JSON = function (obj) {
  return (req, res) => res.write(JSON.stringify(obj)) + res.end()
}

// creates a request handler to render given content through given ui
answer.Section = function (ui, section) {
  const JsonAnswer = answer.JSON(section.data)
  return function (req, res) {
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      log.warn('AJAX REQUEST! %s', req.url)
      log.warn('accept is %s', req.headers.accept)
      return JsonAnswer(req, res)
    }
    log.warn('NON-AJAX REQUEST! %s => %s', req.url, section)
    return ui.render(section).pipe(res)
  }
}

// creates a request handler to write given data "as-is"
answer.Raw = function (data) {
  return (req, res) => res.write(data) + res.end()
}

// TODO i.e. convert a markdown document to html
answer.Document = function (file) {
  throw new Error('not implemented')
  // something like Raw, piping through transforms
}
