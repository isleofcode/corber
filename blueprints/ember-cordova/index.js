'use strict';

var CreateTask       = require('../../lib/tasks/create-cordova-project');
var camelize         = require('../../lib/utils/string.js').camelize;

module.exports = {
  name: 'ember-cordova',

  availableOptions: [
    {
      name: 'name',
      type: String
    }, {
      name: 'cordovaid',
      type: String
    }
  ],

  fileMapTokens: function() {
    return {
      __root__: function() { return '/'; }
    };
  },

  normalizeEntityName: function() {
    // h/t mirage
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },

  afterInstall: function(options) {
    var projectName = this.project.name();

    var create = new CreateTask({
      id: options.cordovaid || camelize(projectName),
      name: options.name || camelize(projectName),
      project: this.project,
      ui: this.ui
    });

    return create.run();
  }
};
