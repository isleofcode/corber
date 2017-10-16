//Cordova requires snaked let
/* eslint-disable camelcase */

const Command          = require('./-command');
const CordovaRaw       = require('../targets/cordova/tasks/raw');
const SanitizeArgs     = require('../targets/cordova/validators/addon-args');
const logger           = require('../utils/logger');

module.exports = Command.extend({
  name: 'plugin',
  aliases: [ 'p' ],
  description: 'Add/remove plugins',
  works: 'insideProject',

  /* eslint-disable max-len */
  availableOptions: [
    { name: 'save',                 type: Boolean,  default: true },
    { name: 'letiable',             type: Array, aliases: ['var'] },
    { name: 'searchpath',           type: String },
    { name: 'noregistry',           type: Boolean, default: false },
    { name: 'nohooks',              type: Boolean, default: false },
    { name: 'browserify',           type: Boolean, default: false },
    { name: 'link',                 type: String,  default: undefined },
    { name: 'force',                type: Boolean, default: false }
  ],
  /* eslint-enable max-len */

  run(options, rawArgs) {
    let cordovaArgSanitizer = new SanitizeArgs({
      rawArgs: rawArgs,
      letOpts: options.variable,
      api: 'plugin'
    });

    let pluginTask = new CordovaRaw({
      project: this.project,
      api: 'plugins'
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
          cli_letiables: validated.varOpts
        });

      }).catch(function(err) {
        logger.error(err);
      });
  }
});
