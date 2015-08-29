// Karma configuration
// Generated on Fri Aug 07 2015 11:52:53 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai-as-promised', 'chai', 'sinon' ],


    // list of files / patterns to load in the browser
    files: [
      'public/assets/libs/angular/angular.js',
      'public/assets/libs/angular-animate/angular-animate.js',
      'public/assets/libs/angular-ui-router/release/angular-ui-router.js',
      'public/assets/libs/angular-aria/angular-aria.js',
      'public/assets/libs/angular-messages/angular-messages.js',
      'public/assets/libs/angular-material/angular-material.js',
      'public/assets/libs/angular-mocks/angular-mocks.js',
      'public/assets/libs/angular-cookies/angular-cookies.js',

      // our app code
      'public/app/*.js',
      'public/app/player/player.js',
      'public/app/**/*.js'
    ],


    // list of files to exclude
    exclude: [
        'karma.conf.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha','nyan','unicorn'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
