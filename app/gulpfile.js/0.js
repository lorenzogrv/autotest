// this gulpfile was splited into multiple files, each containing a task
// following some guidelines found online.
// see https://www.viget.com/articles/gulp-browserify-starter-faq
const tasks = require('./lib/tasks')
const gulp = tasks([
  'browserify',
  'watchify'
])

gulp.task('build', ['browserify'])
gulp.task('watch', ['watchify'], require('./task/server.js'))
gulp.task('default', ['watch'])

/* vim: set expandtab: */
/* vim: set filetype=javascript ts=2 shiftwidth=2: */
