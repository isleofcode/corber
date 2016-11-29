'use strict';

var Task            = require('./-task');
var Promise         = require('ember-cli/lib/ext/promise');
var logger          = require('../utils/logger');

var cordovaPath     = require('../utils/cordova-path');
var fsUtils         = require('../utils/fs-utils');
var path            = require('path');

module.exports = Task.extend({
  project: undefined,

  run: function(hookName) {
    var projectPath, hookPath, hook;

    projectPath = cordovaPath(this.project, true);
    hookPath = path.join(projectPath, 'hooks', hookName + '.js');

    if (fsUtils.existsSync(hookPath)) {
      logger.info('Located hook for: ' + hookName);

      try {
        hook = require(hookPath);

        hook();
        logger.success('Ran hook for: ' + hookName);

        return Promise.resolve();
      } catch (e) {
        logger.error(e);
      }

    } else {
      return Promise.resolve();
    }
  }
});
