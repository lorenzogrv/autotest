var test = require('tape')

var Section = require('..')

test('Section#add', function (t) {
  t.plan(1)
  t.equal(Section.add('something'), Section, 'should return Section')
})

test('Section create/add/master example', function (t) {
  t.plan(2)
  var home
  t.doesNotThrow(function () {
    home = Section.create('home')
      .create('section-one')
      .add('section-one-one')
      .add('section-one-two')
      .master
      .add('section-two')
      .create('section-three')
      .add('section-three-one')
      .add('section-three-two')
      .master
      .add('section-four')
  }, 'should be exectutable without throwing errors')
  t.deepEqual(home.urls(), [
    '/home',
    '/home/section-one',
    '/home/section-one/section-one-one',
    '/home/section-one/section-one-two',
    '/home/section-two',
    '/home/section-three',
    '/home/section-three/section-three-one',
    '/home/section-three/section-three-two',
    '/home/section-four'
  ], 'should be converted to a map as expected')
})
