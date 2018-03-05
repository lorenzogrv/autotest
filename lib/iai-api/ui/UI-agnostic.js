const { EventEmitter } = require('events')
const abc = require('iai-abc')
const log = abc.log

var UI = module.exports = new EventEmitter()

UI.create = function UserInterface (index) {
  // TODO assert this context is either UI or inherits it
  const instance = Object.create(this)
  // initialize the emitter (or pray something instead)
  EventEmitter.call(instance)

  instance.index = index

  return instance
}

UI.render = function (content) {
  log.warn('now i should render %s that has url %s', content, content.url)
  throw abc.Error('UI#render should implemented at backend/browser entry points')
}
