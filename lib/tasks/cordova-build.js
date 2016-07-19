'use strict';

var Task            = require('ember-cli/lib/models/task');
var BashTask        = require('../tasks/bash');
var cordovaPath     = require('../utils/cordova-path');
var defaultPlatform = require('../utils/default-platform');

module.exports = Task.extend({
  project: undefined,

  platform: undefined,
  isRelease: false,

  run: function() {
    this.validateArgs();

    var platform    = this.platform || defaultPlatform(this.project);
    var _cdvCommand = 'cordova build ' + platform;
    var cdvCommand  = this.isRelease === true ?
                        _cdvCommand + ' --release' :
                        _cdvCommand;
    var bashTask    = new BashTask({
                        command: cdvCommand,
                        options: {
                          cwd: cordovaPath(this.project)
                        }
                      });

    return bashTask.run();
  },

  validateArgs: function() {
    if (this.project === undefined) {
      throw 'must pass project to CdvBuildTask';
    }
  }
});
