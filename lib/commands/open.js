'use strict';

var OpenAppTask     = require('../tasks/open-app');

var path            = require('path');
var defaultPlatform = require('../utils/default-platform');

module.exports = {
  name: 'cordova:open',
  aliases: ['cdv:open'],
  description: 'Open the native platform project with the default or specified application',
  works: 'insideProject',

  availableOptions: [
    { name: 'platform', type: String },
    { name: 'application', type: String}
  ],

  run: function(options) {
    var platform = options.platform || defaultPlatform(this.project);
    var open = new OpenAppTask({
      ui: this.ui,
      project: this.project,
      platform: platform,
      application: options.application
    });

    return open.run();
  }
};
