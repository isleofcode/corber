'use strict';

var CreateTask        = require('../../lib/tasks/create-cordova-project');

var stringUtils       = require('../../lib/utils/string');
var defaultPlatform   = require('../../lib/utils/default-platform');

module.exports = {
  name: 'cordova',

  fileMapTokens: function() {
    return {
      __root__: function(options) {
        if (options.inAddon) {
          return path.join('tests', 'dummy');
        }

        return '/';
      }
    };
  },

  afterInstall: function(options) {
    this.options          = options.entity.options;
    this.options.platform = options.platform || defaultPlatform(this.project);

    this.project.cordovaConfig = {
      name: stringUtils.classify(this.project.name()),
      id: options.entity.name
    };

    var create = new CreateTask({
      project: this.project,
      ui: this.ui
    });

    return create.run()
  }
};
