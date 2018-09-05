var gulp = require('gulp')
var path = require('./path').gulpfile

module.exports = function (tasks) {
  tasks.forEach(name => gulp.task(name, require(path.to('task', name))))
  return gulp
}
