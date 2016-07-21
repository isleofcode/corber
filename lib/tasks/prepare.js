'use strict';

var Task            = require('ember-cli/lib/models/task');
var BashTask        = require('../tasks/bash');

var cordovaPath     = require('../utils/cordova-path');

module.exports = Task.extend({
  project: undefined,
  ui: undefined,

  run: function() {
    var cdvPath, cdvCommand, prepare;

    this.validateArgs();

    cdvPath = cordovaPath(this.project);
    cdvCommand = 'cordova prepare';

    this.ui.writeLine('Running cordova prepare');

    prepare = new BashTask({
      command: cdvCommand,
      options: {
        cwd: cdvPath
      }
    });

    return prepare.run();
  },

  validateArgs: function() {
    if (this.project === undefined) {
      throw new Error('A project must be passed to PrepareTask');
    }
  }
});
