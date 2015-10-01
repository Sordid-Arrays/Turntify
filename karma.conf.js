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
      'public/app/search/search.js',
      'public/app/**/*.js',

      // templates
      'public/app/existing_playlist/existingPlaylist.html'
    ],


    // list of files to exclude
    exclude: [
        'karma.conf.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    // generate js files from html templates
    preprocessors: {
      'public/app/existing_playlist/existingPlaylist.html': 'ng-html2js'
    },

    ngHtml2JsPreprocessor: {
      // strip this from the file path
      stripPrefix: 'public/',
      // stripSuffix: '.ext',
      // prepend this to the
      // prependPrefix: 'served/',

      // // or define a custom transform function
      // // - cacheId returned is used to load template
      // //   module(cacheId) will return template at filepath
      // cacheIdFromPath: function(filepath) {
      //   // example strips 'public/' from anywhere in the path
      //   // module(app/templates/template.html) => app/public/templates/template.html
      //   var cacheId = filepath.strip('public/', '');
      //   return cacheId;
      // },

      // - setting this option will create only a single module that contains templates
      //   from all the files, so you can load them all with module('foo')
      // - you may provide a function(htmlPath, originalPath) instead of a string
      //   if you'd like to generate modules dynamically
      //   htmlPath is a originalPath stripped and/or prepended
      //   with all provided suffixes and prefixes
      moduleName: 'foo'
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
