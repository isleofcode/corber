'use strict';

var EmberBuildTask  = require('../tasks/ember-build');
var CdvBuildTask    = require('../tasks/cordova-build');
var LinkTask        = require('../tasks/link-environment');
var HookTask        = require('../tasks/run-hook');

var defaultPlatform = require('../utils/default-platform');

var validateLocationType = require('../utils/validate-location-type');

module.exports = {
  name: 'cordova:build',
  aliases: ['cdv:build'],
  description: 'Build ember & cordova applications',
  works: 'insideProject',

  availableOptions: [{
    name: 'environment',
    type: String,
    default: 'development',
    aliases: ['env']
  }, {
    name: 'platform',
    type: String
  }, {
    name: 'release',
    type: Boolean
  }],

  run: function(options) {
    var platform, release, hook, emberBuild, link, cordovaBuild;

    validateLocationType(this.project.config());

    platform = options.platform || defaultPlatform(this.project);
    release = options.release !== false && options.release !== undefined;

    hook = new HookTask({
      project: this.project,
      ui: this.ui
    });

    emberBuild = new EmberBuildTask({
      project: this.project,
      ui: this.ui,
      buildOptions: options.buildOptions
    });

    link = new LinkTask({
      project: this.project,
      ui: this.ui
    });

    cordovaBuild = new CdvBuildTask({
      project: this.project,
      platform: platform,
      isRelease: release
    });

    return hook.run('beforeBuild')
           .then(emberBuild.run(options.environment))
           .then(link.run())
           .then(cordovaBuild.run())
           .then(hook.run('afterBuild'))
           .catch(function(err) {
             throw 'ERROR(ember cdv:build): ' + err;
           });
  }
};
