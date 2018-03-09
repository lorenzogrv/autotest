const { PassThrough } = require('stream')
const fs = require('fs')
const cheerio = require('cheerio')

var UI = module.exports = Object.create(require('./UI-agnostic'))

UI.render = function (content) {
  // render must return an stream, so it can be piped to any writable dest
  const output = new PassThrough()
  // render starts converting the HTML to a cheerio object
  fs.createReadStream(this.index).pipe(stream2cheerio($ => {
    // now the cheerio object can be altered as needed to edit the html
    // this responsability is deferred outside the UI object
    this.emit('render', $, content)
    // once done, write-out the result and end the output stream
    output.end($.html())
  }))
  return output
}

// tiny utility stream to read until source ends and callback a cheerio object
function stream2cheerio (callback) {
  var result = ''
  var mock = new PassThrough()
  mock._transform = function (data, encoding, callback) {
    result += data.toString('utf8')
    callback()
  }
  // once the file is read, it can be converted to a cheerio object
  // resume must be called on to trigger the read mechanism
  return mock.on('end', () => callback(cheerio.load(result))).resume()
}

function oldSpaguettiCode () {
    var parts = req.url.split('/').slice(1)
    var cumbs = []
    var v = RootView
    while (parts.length) {
      v = v.create(parts.shift())
      cumbs.push(v)
      continue
      // TODO this should be pushed instead
      cumbs.push({
        ref: null, // the parts.shift() thing
        url: cumbs[cumbs.length - 1].url + '/' + 'name', // or "/"
        obj: view
      })
    }
    log.warn('here it should insert view on index and pipe it to response')
    var $ = cheerio.load(index)
    while (cumbs.length) {
      cumbs.shift().inlay($)
    }
    res.write($.html())
    res.end()
}
