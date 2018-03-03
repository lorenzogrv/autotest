const fs = require('fs')
const abc = require('iai-abc')
const log = abc.log

log.level = abc.Log.VERB

// EXPOSED OBJ
var answer = module.exports = {}

// There is NO next function here as answers ARE NOT middleware

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
      .stdout.toString('utf8').split('\n')
      .filter((file) => !!file)
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
  // TODO YAGNI opts.NotFound
  const NotFound = answer.NotFound()
  log.verb('Created Router answer (%s urls total)', Object.keys(urls).length)
  return function handle (req, res) {
    if (typeof urls[req.url] === 'function') {
      return urls[req.url](req, res)
    }
    return NotFound(req, res)
  }
}

// creates a request handler to answer a 404 Not Found response
answer.NotFound = function (opts) {
  // TODO opts?
  return function (req, res) {
    res.writeHead(404, {
      'Connection': 'close',
      'Content-Type': 'text/plain'
    })
    res.end('url not found: ' + req.url)
  }
}

// creates a request handler to serve file "as-is"
answer.File = function (file) {
  return (req, res) => fs.createReadStream(file).pipe(res)
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
