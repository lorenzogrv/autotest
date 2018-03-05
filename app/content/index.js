const { Section } = require('iai-api')

module.exports = Section
  .add('home', {
    html: '<h1>This is the home screen</h1>'
  })
  .add('devtool', {
    //html: { 'after': '<h1 id="stdin"></h1>' },
    css: [],
    js: [ '/js/devtools.js' ]
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
