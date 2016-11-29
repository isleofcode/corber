'use strict';

var Task            = require('./-task');
var Promise         = require('ember-cli/lib/ext/promise');
var cordovaPath     = require('../utils/cordova-path');
var cordovaProj     = require('cordova-lib').cordova;
var logger          = require('../utils/logger');

module.exports = Task.extend({
  project: undefined,
  rawApi: undefined,

  cordovaRawPromise: function() {
    return cordovaProj.raw[this.rawApi].apply(this, arguments)
      .catch(function(err) {
        logger.error('Cordova raw error \n' + err);
      });
  },

  run: function() {
    var args = arguments;
    return new Promise(function(resolve) {
      var emberPath = process.cwd();
      process.chdir(cordovaPath(this.project));

      this.cordovaRawPromise.apply(this, args).then(function() {
        process.chdir(emberPath);
        resolve();
      });
    }.bind(this));
  }
});
