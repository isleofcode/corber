'use strict';

//Cordova requires snaked var
/* eslint-disable camelcase */

var Command         = require('./-command');
var CordovaRawTask  = require('../tasks/cordova-raw');
var SanitizeArgs    = require('../tasks/validate/sanitize-addon-args');
var logger          = require('../utils/logger');

module.exports = Command.extend({
  name: 'cordova:plugin',
  aliases: ['cdv:plugin', 'cdv:p'],
  description: 'Add/remove plugins',
  works: 'insideProject',

  /* eslint-disable max-len */
  availableOptions: [
    { name: 'save',                 type: Boolean,  default: true },
    { name: 'variable',             type: Array },
    { name: 'searchpath',           type: String },
    { name: 'noregistry',           type: Boolean, default: false },
    { name: 'nohooks',              type: Boolean, default: false },
    { name: 'browserify',           type: Boolean, default: false },
    { name: 'link',                 type: String,  default: undefined },
    { name: 'force',                type: Boolean, default: false }
  ],
  /* eslint-enable max-len */

  run: function(options, rawArgs) {
    var cordovaArgSanitizer = new SanitizeArgs({
      rawArgs: rawArgs,
      varOpts: options.variable,
      api: 'plugin'
    });

    var pluginTask = new CordovaRawTask({
      project: this.project,
      rawApi: 'plugins'
    });

    return cordovaArgSanitizer.run()
      .then(function(validated) {
        logger.info(
          'Preparing to ' + validated.action + ' plugins ' + rawArgs
        );

        return pluginTask.run(validated.action, validated.name, {
          save: options.save,
          searchpath: options.searchpath,
          noregistry: options.noregistry,
          nohooks: options.nohooks,
          browserify: options.browserify,
          link: options.link,
          force: options.force,
          cli_variables: validated.varOpts
        });

      }).catch(function(err) {
        logger.error(err);
      });
  }
});
