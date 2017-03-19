'use strict';

var Task            = require('./-task');
var cordovaPath     = require('../utils/cordova-path');
var cordovaLib      = require('cordova-lib');
var cordovaProj     = cordovaLib.cordova;
var events          = cordovaLib.events;
var cordovaLogger   = require('cordova-common').CordovaLogger.get();

module.exports = Task.extend({
  project: undefined,
  rawApi: undefined,

  cordovaRawPromise: function(/* rawArgs */) {
    return cordovaProj.raw[this.rawApi].apply(this, arguments);
  },

  run: function() {
    var args = arguments;
    var emberPath = process.cwd();
    var debug = process.env.DEBUG;

    process.chdir(cordovaPath(this.project));
    cordovaLogger.subscribe(events);

    if (debug && (debug === '*' || debug.indexOf('cordova') > -1)) {
      cordovaLogger.setLevel('verbose');
    }

    return this.cordovaRawPromise.apply(this, args)
      .then(function() {
        process.chdir(emberPath);
      });
  }
});
