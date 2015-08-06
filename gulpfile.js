var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  autoprefix = require('gulp-autoprefixer'),
  minifyCSS = require('gulp-minify-css'),
  rename = require('gulp-rename'),
  del = require('del');



gulp.task('deleteMin', function(){
  del(['./public/assets/css/min/*'], function(err){});
});

gulp.task('lint', function(){
  return  gulp
    .src(['./public/app/**/*.js', './app.js', './controller/*.js', './models/*.js', './middlewares/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('styles', function(){
  return gulp
    .src('./public/assets/css/*.css')
    .pipe(autoprefix(['> 1%', 'last 3 versions', 'Firefox ESR', 'Opera 12.1']))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./public/assets/css/min/'));
});


gulp.task('default', ['deleteMin', 'styles', 'lint']);