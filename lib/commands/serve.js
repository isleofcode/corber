'use strict';

var Command         = require('./-command');

var CdvBuildTask    = require('../tasks/cordova-build');
var HookTask        = require('../tasks/run-hook');
var ServeTask       = require('../tasks/serve');
var logger          = require('../utils/logger');

var Promise         = require('ember-cli/lib/ext/promise');
var PortFinder      = require('portfinder');
var _merge          = require('lodash').merge;

var ValidateLocationType    = require('../tasks/validate/location-type');
var ValidatePlatformTask    = require('../tasks/validate/platform');
var ValidatePluginTask      = require('../tasks/validate/plugin');
var ValidateAllowNavigation = require('../tasks/validate/allow-navigation');
var ValidateRootUrl         = require('../tasks/validate/root-url');

var CreateLiveReloadShell   = require('../tasks/create-livereload-shell');

var getPort     = Promise.denodeify(PortFinder.getPort);
var defaultPort = process.env.PORT || 4200;

module.exports = Command.extend({
  name: 'cordova:serve',
  aliases: [
    'cordova:serve',
    'cdv:serve',
    'cdv:s'
  ],
  description: 'Builds app, then runs liveReload server',
  works: 'insideProject',

  /* eslint-disable max-len */
  availableOptions: [
    { name: 'platform',             type: String,  default: 'ios' },
    { name: 'reload-url',           type: String,                          aliases: ['r'] },
    { name: 'verbose',              type: Boolean, default: false,         aliases: ['v'] },
    { name: 'port',                 type: Number,  default: defaultPort,   aliases: ['p'] },
    { name: 'host',                 type: String,                          aliases: ['H'],     description: 'Listens on all interfaces by default' },
    { name: 'proxy',                type: String,                          aliases: ['pr', 'pxy'] },
    { name: 'insecure-proxy',       type: Boolean, default: false,         aliases: ['inspr'], description: 'Set false to proxy self-signed SSL certificates' },
    { name: 'transparent-proxy',    type: Boolean, default: true,          aliases: ['transp'], description: 'Set to false to omit x-forwarded-* headers when proxying' },
    { name: 'watcher',              type: String,  default: 'events',      aliases: ['w'] },
    { name: 'live-reload',          type: Boolean, default: true,          aliases: ['lr'] },
    { name: 'live-reload-host',     type: String,                          aliases: ['lrh'],   description: 'Defaults to host' },
    { name: 'live-reload-base-url', type: String,                          aliases: ['lrbu'],  description: 'Defaults to baseURL' },
    { name: 'live-reload-port',     type: Number,                          aliases: ['lrp'],   description: '(Defaults to port number within [49152...65535])' },
    { name: 'environment',          type: String,  default: 'development', aliases: ['e', 'env', { 'dev': 'development' }, { 'prod': 'production' }] },
    { name: 'ssl',                  type: Boolean, default: false },
    { name: 'ssl-key',              type: String,  default: 'ssl/server.key' },
    { name: 'ssl-cert',             type: String,  default: 'ssl/server.crt' },
    { name: 'force',                type: Boolean, default: false },
    { name: 'skip-ember-build',     type: Boolean, default: false},
    { name: 'skip-cordova-build',   type: Boolean, default: false}
  ],
  /* eslint-enable max-len */

  run: function(options) {
    this._super.apply(this, arguments);

    var command = this;
    var platform = options.platform;

    //Vars for live reload addon service
    this.project.targetIsCordova = true;
    this.project.targetIsCordovaLivereload = true
    this.project.CORDOVA_PLATFORM = platform;

    var validateRootUrl = new ValidateRootUrl({
      project: this.project
    });

    var validateLocationType = new ValidateLocationType({
      project: this.project
    });

    var validateAllowNavigation = new ValidateAllowNavigation({
      project: this.project,
      platform: platform
    });

    var validatePlugin = new ValidatePluginTask({
      project: this.project,
      platform: platform,
      pluginName: 'cordova-plugin-whitelist'
    });

    var validatePlatform = new ValidatePlatformTask({
      project: this.project,
      platform: platform
    });

    var hook = new HookTask({
      project: this.project
    });

    var setupLivereload = new CreateLiveReloadShell({
      project: this.project
    });

    var cordovaBuild = new CdvBuildTask({
      project: this.project,
      platform: options.platform
    });

    var serve = new ServeTask({
      project: this.project,
      ui: this.ui,
      analytics: this.analytics
    });

    return validateRootUrl.run(this.project.config(), options.force)
      .then(validateLocationType.prepare(this.project.config()))
      .then(validateAllowNavigation.prepare(true))
      .then(validatePlatform.prepare())
      .then(validatePlugin.prepare())
      .then(hook.prepare('beforeBuild'))
      .then(this._autoFindLiveReloadPort.bind(this, options))
      .then(function(serveOpts) {

        return setupLivereload.run(serveOpts.port, options.reloadUrl)
          .then(function() {
            if (options.skipCordovaBuild !== true) {
              return cordovaBuild.run(platform);
            }
          })
          .then(hook.prepare('afterBuild'))
          .then(function() {
            var config = command.project.config(serveOpts.environment);

            _merge(serveOpts, {
              baseURL: config.baseURL || '/',
              rootURL: config.rootURL || '/',
              project: command.project
            });

            if (options.skipEmberBuild !== true) {
              return serve.run(serveOpts)
            }
          })
      })
    .catch(function(e) {
      logger.error(e);
    });
  },

  //Taken from from ember-cli
  //https://github.com/ember-cli/ember-cli/blob/master/lib/commands/serve.js#L97-L117
  _autoFindLiveReloadPort: function(commandOptions) {
    return getPort({
      port: commandOptions.liveReloadPort,
      host: commandOptions.liveReloadHost
    })
    .then(function(foundPort) {
      // if live reload port matches express port, try one higher
      if (foundPort === commandOptions.port) {
        commandOptions.liveReloadPort = foundPort + 1;
        return this._autoFindLiveReloadPort(commandOptions);
      }

      // port was already open
      if (foundPort === commandOptions.liveReloadPort) {
        return commandOptions;
      }

      // use found port as live reload port
      commandOptions.liveReloadPort = foundPort;

      return commandOptions;
    });
  }.bind(this)
});
