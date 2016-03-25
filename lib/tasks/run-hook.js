'use strict';

var Task        = require('ember-cli/lib/models/task');
var Promise     = require('ember-cli/lib/ext/promise');

var cordovaPath = require('../utils/cordova-path');
var fs          = require('fs');
var path        = require('path');

module.exports = Task.extend({
  run: function(hookName) {
    var root = this.project.root;
    var hookPath = path.join(cordovaPath(this.project, true), 'hooks', hookName + '.js');

    if (fs.existsSync(hookPath)) {
      this.ui.writeLine("Located hook for: " + hookName);
      var hook = require(hookPath);
      hook();
      this.ui.writeLine("Ran hook for: " + hookName);
    }

    return Promise.resolve()
  }
});
