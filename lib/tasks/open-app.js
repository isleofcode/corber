'use strict';

var Task           = require('ember-cli/lib/models/task');
var Promise        = require('ember-cli/lib/ext/promise');

var path           = require('path');
var exec           = require('child_process').exec;
var getOpenCommand = require('../utils/open-app-command');
var cordovaPath    = require('../utils/cordova-path');

module.exports = Task.extend({
  run: function() {
    var projectPath, command;
    var cdvPath = cordovaPath(this.project);
    if (this.platform === 'ios') {
      projectPath = path.join(cdvPath, 'platforms/ios/*.xcodeproj');
    } else if (this.platform === 'android') {
      projectPath = path.join(cdvPath, 'platforms/android/.project');
    } else {
      return Promise.reject(new Error('The ' + this.platform + ' platform is not supported. Please use "ios" or "android"'));
    }

    var command = getOpenCommand(projectPath, this.application);

    this.ui.writeLine("Opening app for " + this.platform);

    return exec(command);
  }
});
