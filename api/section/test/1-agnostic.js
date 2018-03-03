var test = require('tape')

var Section = require('..')

test('Section#add', function (t) {
  t.plan(1)
  t.equal(Section.add('something'), Section, 'should return Section')
})

test('Section create/add/master example', function (t) {
  t.plan(2)
  var home, one, two, three, four, one1, one2, three1, three2
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
  ], 'should be converted to an array as expected')
})

test('Section#descendants example', function (t) {
  t.plan(2)
  var home, one, two, three, four, one1, one2, three1, three2
  t.doesNotThrow(function () {
    home = Section.create('home')
    one = home.create('section-one')
    one1 = one.create('section-one-one')
    one2 = one.create('section-one-two')
    two = home.create('section-two')
    three = home.create('section-three')
    three1 = three.create('section-three-one')
    three2 = three.create('section-three-two')
    four = home.create('section-four')
  }, 'should be exectutable without throwing errors')
  t.deepEqual(home.descendants(), {
    '/home': home,
    '/home/section-one': one,
    '/home/section-one/section-one-one': one1,
    '/home/section-one/section-one-two': one2,
    '/home/section-two': two,
    '/home/section-three': three,
    '/home/section-three/section-three-one': three1,
    '/home/section-three/section-three-two': three2,
    '/home/section-four': four
  }, 'should be converted to an object as expected')
})
