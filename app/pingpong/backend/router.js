const iai = require('iai-api')
const log = iai.log

log.level = iai.Log.VERB

const path = iai.path(__dirname, '..')
const Section = iai.Section

var content = Section
  .add('home', {
    html: '<h1>This is the home screen</h1>'
  })
  .add('terminal', {
    html: { 'after': '<h1 id="stdin"></h1>' },
    css: [],
    js: []
  })
  .create('section-one', {
    html: '<h1>This is the section one</h1>'
  })
  .add('section-one-one')
  .add('section-one-two')
  .master
  .add('section-two', {
    html: '<h1>This is the section two</h1>'
  })
  .create('section-three', {
    html: '<h1>This is the section three</h1>'
  })
  .add('section-three-one')
  .add('section-three-two')
  .master
  .add('section-four', {
    html: '<h1>This is the section four</h1>'
  })
  .master

var urls = {
  '/unexistant-url': iai.answer.NotFound(),
  '/urls': iai.answer.NotFound()
}

module.exports = iai.answer.Router({
  urls: urls,
  menu: content,
  www: path.to('www')
})
