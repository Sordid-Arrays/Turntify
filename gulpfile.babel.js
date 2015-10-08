import gulp from 'gulp';
import jshint from 'gulp-jshint';
import stylish from 'jshint-stylish';
import autoprefix from 'gulp-autoprefixer';
import minifyCSS from 'gulp-minify-css';
import rename from 'gulp-rename';
import del from 'del';
import mocha from 'gulp-mocha';
import karma from 'karma';
import sass from 'gulp-sass';

var server = karma.server;

gulp.task('deleteMin', () => {
  del(['./public/assets/css/min/*'], function(err){});
});

gulp.task('lint', () => {
  return  gulp
    .src(['./public/app/**/*.js', './app.js', './controller/*.js', './models/*.js', './middlewares/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('styles', () => {
  return gulp
    .src('./public/assets/css/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefix(['> 1%', 'last 3 versions', 'Firefox ESR', 'Opera 12.1']))
    .pipe(minifyCSS())
    .pipe(rename({'suffix': '.min'}))
    .pipe(gulp.dest('./public/assets/css/min/'));
});

// second arg tells gulp that test-client must complete before test-server can run
gulp.task('test-server', ['test-client'], () => {
  return gulp.src(['tests/db/*.js', 'tests/server/**/*.js'], { read: false })
    .pipe(mocha({
      reporter: 'spec'
    }))
    // make sure test suite exits once complete
    .once('error', (err) => {
      console.log('error & exit');
      process.exit();
    })
    .once('end', () => {
      process.exit();
    });
});

// takes in a callback (done) so the engine knows when this task is done
gulp.task('test-client', (done) =>  {
  server.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, (exitCode) => {
    console.log('Karma has exited with ' + exitCode);
    done(exitCode);
  });
});

gulp.task('test', ['test-client','test-server']);

gulp.task('default', ['deleteMin', 'styles', 'lint']);
