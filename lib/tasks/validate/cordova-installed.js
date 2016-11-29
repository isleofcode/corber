'use strict';

var Task            = require('../-task');
var Promise         = require('ember-cli/lib/ext/promise');
var commandExists   = require('../../utils/command-exists');
var logger          = require('../../utils/logger');

var cordovaInstallText = '\nThe command `cordova` was not found. This likely ' +
  'means you need to install cordova globally.  Please run the following ' +
  'command to continue.\n\t' +
  'npm install cordova -g \n' +
  'installed by checking that the following command returns the currently ' +
  'installed version:\n\t';

module.exports = Task.extend({
  options: undefined,

  run: function() {
    if (this.options && this.options.skipCordovaCheck === true) {
      return Promise.resolve();
    }

    return new Promise(function(resolve) {
      var result = commandExists('cordova');

      if (result) {
        resolve();
      }

      logger.error(cordovaInstallText);
    });
  }
});
