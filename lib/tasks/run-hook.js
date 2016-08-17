'use strict';

var Task            = require('./-task');
var Promise         = require('ember-cli/lib/ext/promise');

var cordovaPath     = require('../utils/cordova-path');
var fs              = require('fs');
var path            = require('path');

module.exports = Task.extend({
  run: function(hookName) {
    var projectPath, hookPath, hook;

    projectPath = cordovaPath(this.project, true);
    hookPath = path.join(projectPath, 'hooks', hookName + '.js');

    if (fs.existsSync(hookPath)) {
      this.ui.writeLine('Located hook for: ' + hookName);

      try {
        hook = require(hookPath);

        hook();
        this.ui.writeLine('Ran hook for: ' + hookName);

        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }

    } else {
      return Promise.resolve();
    }
  }
});
