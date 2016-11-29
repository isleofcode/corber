'use strict';

var Task            = require('./-task');
var CordovaRawTask  = require('../tasks/cordova-raw');
var logger          = require('../utils/logger');

module.exports = Task.extend({
  project: undefined,

  run: function() {
    logger.info('Running cordova prepare');
    var prepare = new CordovaRawTask({
      project: this.project,
      rawApi: 'prepare',
    });

    return prepare.run();
  }
});
