'use strict';

var Task            = require('ember-cli/lib/models/task');
var BashTask        = require('../tasks/bash');
var cordovaPath     = require('../utils/cordova-path');

module.exports = Task.extend({
  run: function(platform, env) {
    var cdvCommand = 'cordova build ' + platform;
    if (env === 'production') {
      cdvCommand += ' --release';
    }

    var cdvBuild = new BashTask({
      command: cdvCommand,
      options: {
        cwd: cordovaPath(this.project)
      }
    });

    return cdvBuild.run();
  }
});
