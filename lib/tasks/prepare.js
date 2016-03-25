'use strict';

var Task         = require('ember-cli/lib/models/task');
var BashTask    = require('../tasks/bash');

var cordovaPath  = require('../utils/cordova-path');
var fs           = require('fs-extra');

module.exports = Task.extend({
  init: function() {
    if (!this.project) {
      throw new Error('A project must be passed into this function');
    }
  },

  run: function() {
    var cdvPath = cordovaPath(this.project);
    var cdvCommand = 'cordova prepare';

    this.ui.writeLine("Running cordova prepare");

    var prepare = new BashTask({
      command: cdvCommand,
      options: {
        cwd: cdvPath
      }
    });

    return prepare.run();
  }
});
