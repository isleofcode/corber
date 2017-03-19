'use strict';

var Command         = require('./-command');

var CdvBuildTask    = require('../tasks/cordova-build');
var HookTask        = require('../tasks/run-hook');
var BuildTask       = require('../tasks/ember-build');
var runValidators   = require('../utils/run-validators');
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
    { name: 'environment',                         type: String,  default: 'development',               aliases: ['e', 'env', { 'dev': 'development' }, { 'prod': 'production' }] },
    { name: 'cordova-output-path',                 type: 'Path',  default: 'ember-cordova/cordova/www', aliases: ['op', 'out'] },
    { name: 'release',                             type: Boolean, default: false },
    { name: 'device',                              type: Boolean, default: true },
    { name: 'emulator',                            type: Boolean, default: false },
    { name: 'build-config',                        type: 'Path', aliases: ['buildConfig'] },
    { name: 'force',                               type: Boolean, default: false },
    { name: 'skip-cordova-build',                  type: Boolean, default: false},
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

  startValidators: function(project, options) {
    var validations = [];
    var projectConfig = project.config(options.environment);

    var validateRootUrl = new ValidateRootUrl({
      config: projectConfig,
      force: options.force
    });

    var validateLocationType = new ValidateLocationType({
      config: projectConfig
    });

    var validateAllowNavigation = new ValidateAllowNavigation({
      project: project,
      rejectIfUndefined: false
    });

    validations.push(
      validateRootUrl.run(),
      validateLocationType.run(),
      validateAllowNavigation.run()
    );

    if (options.skipCordovaBuild !== true) {
      var validatePlatform = new ValidatePlatformTask({
        project: project,
        platform: options.platform
      });

      validations.push(validatePlatform.run());
    }

    return runValidators(validations);
  },

  run: function(options) {
    this._super.apply(this, arguments);

    var project = this.project;
    var platform = options.platform;

    //Vars for live reload addon service
    this.project.targetIsCordova = true;
    this.project.CORDOVA_PLATFORM = platform;

    var hook = new HookTask({
      project: project
    });

    var emberBuild = new BuildTask({
      project: project,
      environment: options.environment,
      outputPath: options.cordovaOutputPath
    });

    var cordovaOpts = parseCordovaOpts(platform, options);
    var cordovaBuild = new CdvBuildTask({
      project: project,
      platform: platform,
      cordovaOpts: cordovaOpts,
      verbose: options.verbose
    });

    logger.info('ember-cordova: Building app');

    return this.startValidators(project, options)
      .then(hook.prepare('beforeBuild', options))
      .then(function() {
        if (options.skipEmberBuild !== true) {
          return emberBuild.run();
        }
      })
      .then(function() {
        if (options.skipCordovaBuild !== true) {
          return cordovaBuild.run();
        }
      })
      .then(hook.prepare('afterBuild', options))
      .then(function() {
        logger.success('ember-cordova project built');
      })
      .catch(function(e) {
        logger.error(e);
      });
  }
});
