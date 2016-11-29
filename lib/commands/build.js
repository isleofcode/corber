'use strict';

var Command         = require('./-command');

var CdvBuildTask    = require('../tasks/cordova-build');
var HookTask        = require('../tasks/run-hook');
var BuildTask       = require('../tasks/ember-build');
var logger          = require('../utils/logger');

var ValidateLocationType    = require('../tasks/validate/location-type');
var ValidatePlatformTask    = require('../tasks/validate/platform');
var ValidateAllowNavigation = require('../tasks/validate/allow-navigation');
var ValidateRootUrl         = require('../tasks/validate/root-url');
var parseCordovaOpts        = require('../utils/parse-cordova-build-opts');

module.exports = Command.extend({
  name: 'cordova:build',
  aliases: ['cdv:build', 'cdv:b'],
  description: 'Build the ember application for cordova',
  works: 'insideProject',

  /* eslint-disable max-len */
  availableOptions: [
    { name: 'platform',                            type: String,  default: 'ios' },
    { name: 'verbose',                             type: Boolean, default: false,                       aliases: ['v'] },
    { name: 'environment',                         type: String,  default: 'development',               aliases: ['e', 'env', { 'dev': 'development' }, { 'prod': 'production' }] },
    { name: 'cordova-output-path',                 type: 'Path',  default: 'ember-cordova/cordova/www', aliases: ['op', 'out'] },
    { name: 'release',                             type: Boolean, default: false },
    { name: 'device',                              type: Boolean, default: true },
    { name: 'emulator',                            type: Boolean, default: false },
    { name: 'build-config',                        type: 'Path', aliases: ['buildConfig'] },
    { name: 'force',                               type: Boolean, default: false },
    { name: 'skip-ember-build',                    type: Boolean, default: false},

    // iOS Signing Options
    { name: 'code-sign-identity',                  type: String },
    { name: 'provisioning-profile',                type: String },
    { name: 'codesign-resource-rules',             type: String },

    // android Signing Options
    { name: 'keystore',                            type: String },
    { name: 'store-password',                      type: String },
    { name: 'alias',                               type: String },
    { name: 'password',                            type: String },
    { name: 'keystore-type',                       type: String }
  ],
  /* eslint-enable max-len */

  run: function(options) {
    this._super.apply(this, arguments);

    var project = this.project;
    var platform = options.platform;
    var cordovaOpts = parseCordovaOpts(platform, options);

    //Vars for live reload addon service
    this.project.targetIsCordova = true;
    this.project.CORDOVA_PLATFORM = platform;

    var validateLocationType = new ValidateLocationType({
      project: this.project
    });

    var validateAllowNavigation = new ValidateAllowNavigation({
      project: this.project
    });

    var validateRootUrl = new ValidateRootUrl({
      project: this.project
    });

    var validatePlatform = new ValidatePlatformTask({
      project: this.project,
      platform: platform
    });

    var hook = new HookTask({
      project: project
    });

    var emberBuild = new BuildTask({
      project: project,
      environment: options.environment,
      outputPath: options.cordovaOutputPath
    });

    var cordovaBuild = new CdvBuildTask({
      project: project,
      platform: platform,
      cordovaOpts: cordovaOpts
    });

    logger.info('ember-cordova: Building app');

    return validateRootUrl.run(this.project.config(), options.force)
      .then(validateLocationType.prepare(this.project.config()))
      .then(validateAllowNavigation.prepare(false))
      .then(validatePlatform.prepare())
      .then(hook.prepare('beforeBuild'))
      .then(function() {
        if (options.skipEmberBuild !== true) {
          return emberBuild.run();
        }
      })
      .then(cordovaBuild.prepare())
      .then(hook.prepare('afterBuild'))
      .then(function() {
        logger.success('ember-cordova project built');
      })
      .catch(function(e) {
        logger.error(e);
      });
  }
});
