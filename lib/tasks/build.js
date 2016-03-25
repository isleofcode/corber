'use strict';

var Task        = require('ember-cli/lib/models/task');
var Builder     = require('ember-cli/lib/models/builder');
var BashTask    = require('../tasks/bash');

var cordovaPath = require('../utils/cordova-path');
var linkEnv     = require('../tasks/link-environment');

module.exports = Task.extend({
  run: function() {
    var emberBuild = new BashTask({
      command: 'ember build --environment ' + this.env,
      ui: this.ui,
      options: {
        cwd: this.project.root
      }
    });

    var cdvCommand = 'cordova build ' + this.platform;
    if (this.env !== 'development') {
      cdvCommand += ' --release'
    }

    var cdvBuild = new BashTask({
      command: cdvCommand,
      ui: this.ui,
      options: {
        cwd: cordovaPath(this.project)
      }
    });

    return emberBuild.run().then(cdvBuild.run());
  }
});
