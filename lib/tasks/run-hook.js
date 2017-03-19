'use strict';

var Task            = require('./-task');
var Promise         = require('ember-cli/lib/ext/promise');
var logger          = require('../utils/logger');

var cordovaPath     = require('../utils/cordova-path');
var fsUtils         = require('../utils/fs-utils');
var path            = require('path');

module.exports = Task.extend({
  project: undefined,

  run: function(hookName, options) {
    var projectPath, hookPath, hook, hookReturn;

    projectPath = cordovaPath(this.project, true);
    hookPath = path.join(projectPath, 'hooks', hookName + '.js');

    if (fsUtils.existsSync(hookPath)) {
      logger.info('Located hook for: ' + hookName);

      try {
        hook = require(hookPath);
        hookReturn = hook(options);

        logger.success('Ran hook for: ' + hookName);

        return Promise.resolve(hookReturn);
      } catch (e) {
        return Promise.reject(e);
      }

    } else {
      return Promise.resolve();
    }
  }
});
