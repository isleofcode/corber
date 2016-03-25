'use strict';

var Task        = require('ember-cli/lib/models/task');
var BashTask    = require('../tasks/bash');

var cordovaPath = require('../utils/cordova-path');

module.exports = Task.extend({
  run: function() {
    var joinedArgs = this.rawArgs.join(' ');
    var cdvCommand = 'cordova ' + joinedArgs;

    var msg = "Running 'cordova " + joinedArgs + "'";
    this.ui.writeLine(msg);

    return new BashTask({
      command: cdvCommand,
      options: {
        cwd: cordovaPath(this.project)
      }
    }).run();
  }
});
