var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var beautify = require('gulp-beautify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
gulp.task('default', ['materialize']);


gulp.task('materialize', function() {
    return gulp.src('node_modules/materialize-css/bin/materialize.js')
      .pipe(concat('materialize.js'))
      .pipe(rename('materialize.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'));
});

gulp.task('jquery', function() {
    return gulp.src('node_modules/materialize-css/bin/materialize.js')
      .pipe(concat('materialize.js'))
      .pipe(rename('materialize.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'));
});
