'use strict';

var Task        = require('ember-cli/lib/models/task');
var BashTask    = require('../tasks/bash');
var LinkTask        = require('../tasks/link-environment');

var cordovaPath = require('../utils/cordova-path');
var linkEnv     = require('../tasks/link-environment');

module.exports = Task.extend({
  run: function() {
    var buildCommand = '';
    if (this.buildOptions) {
      buildCommand = this.buildOptions + ' ';
    }
    buildCommand += 'EMBER_CORDOVA=true ember build --environment ' + this.env;

    var emberBuild = new BashTask({
      command: buildCommand,
      ui: this.ui,
      options: {
        cwd: this.project.root
      }
    });

    var link = new LinkTask({
      project: this.project,
      ui: this.ui
    });

    var cdvCommand = 'cordova build ' + this.platform;
    if (this.env !== 'development') {
      cdvCommand += ' --release';
    }

    var cdvBuild = new BashTask({
      command: cdvCommand,
      ui: this.ui,
      options: {
        cwd: cordovaPath(this.project)
      }
    });

    return emberBuild.run()
           .then(link.run())
           .then(cdvBuild.run());
  }
});
