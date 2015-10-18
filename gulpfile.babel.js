import gulp from 'gulp';
import stylish from 'jshint-stylish';
import del from 'del';
import karma from 'karma';
import gulpLoadPlugins from 'gulp-load-plugins';

const plugins = gulpLoadPlugins();

var server = karma.server;

gulp.task('deleteMin', () => {
  del(['./public/assets/css/min/*'], function(err){});
});

gulp.task('lint', () => {
  return  gulp
    .src(['./public/app/**/*.js', './app.js', './controller/*.js', './models/*.js', './middlewares/*.js'])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish));
});

gulp.task('styles', () => {
  return gulp
    .src('./public/assets/css/*.scss')
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer(['> 1%', 'last 3 versions', 'Firefox ESR', 'Opera 12.1']))
    .pipe(plugins.minifyCss())
    .pipe(plugins.rename({'suffix': '.min'}))
    .pipe(gulp.dest('./public/assets/css/min/'));
});

// second arg tells gulp that test-client must complete before test-server can run
gulp.task('test-server', ['test-client'], () => {
  return gulp.src(['tests/db/*.js', 'tests/server/**/*.js'], { read: false })
    .pipe(plugins.mocha({
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
