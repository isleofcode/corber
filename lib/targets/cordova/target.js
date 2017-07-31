const CoreObject       = require('core-object');
const BuildTask        = require('./tasks/build');
const path             = require('path');
const fsUtils          = require('../../utils/fs-utils');
const runValidators    = require('../../utils/run-validators');

const ValidatePlatformTask    = require('./validators/platform');
const ValidatePluginTask      = require('./validators/plugin');
const ValidateAllowNavigation = require('./validators/allow-navigation');

module.exports = CoreObject.extend({
  platform: undefined,
  project: undefined,

  _buildValidators(isServing, skipCordovaBuild = false) {
    let validators = [];

    validators.push(
      new ValidateAllowNavigation({
        project: this.project,
        rejectIfUndefined: isServing
      }).run()
    );

    if (skipCordovaBuild === false) {
      validators.push(
        new ValidatePlatformTask({
          project: this.project,
          platform: this.platform
        }).run()
      );
    }

    return validators;
  },

  validateBuild(skipCordovaBuild) {
    let validators = this._buildValidators(false, skipCordovaBuild);

    return runValidators(validators);
  },

  validateServe() {
    let validators = this._buildValidators(true);

    validators.push(
      new ValidatePluginTask({
        project: this.project,
        platform: this.platform,
        pluginName: 'cordova-plugin-whitelist'
      }).run()
    );

    return runValidators(validators);
  },

  build(verbose = false) {
    let cordovaBuild = new BuildTask({
      project: this.project,
      platform: this.platform,
      cordovaOpts: this.cordovaOpts,
      verbose: verbose
    });

    return cordovaBuild.run();
  }
});