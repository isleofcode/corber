'use strict';

var BuildTask       = require('../tasks/build');
var LinkTask        = require('../tasks/link-environment');
var HookTask        = require('../tasks/run-hook');

var path            = require('path');
var defaultPlatform = require('../utils/default-platform');

module.exports = {
  name: 'cordova:build',
  aliases: ['cdv:build'],
  description: 'Build ember & cordova applications',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' },
    { name: 'platform', type: String }
  ],

  run: function(options) {
    var platform = options.platform || defaultPlatform(this.project);

    var build = new BuildTask({
      ui: this.ui,
      project: this.project,
      env: options.environment,
      platform: platform
    });

    var link = new LinkTask({
      project: this.project,
      ui: this.ui
    });

    var hook = new HookTask({
      ui: this.ui,
      project: this.project
    });

    return hook.run('beforeBuild')
           .then(build.run())
           .then(link.run())
           .then(hook.run('afterBuild'))
  }
};
