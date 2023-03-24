const CoreObject              = require('core-object');
const Build                   = require('./tasks/build');
const ValidatePlugin          = require('./validators/plugin');
const ValidateSigningIdentity = require('../ios/validators/signing-identity');
const AllowNavigation         = require('./validators/allow-navigation');
const runValidators           = require('../../utils/run-validators');

module.exports = CoreObject.extend({
  platform: undefined,
  project: undefined,
  browserify: false,
  signingIdentityValidation: undefined,
  cordovaOpts: {},

  _buildValidators(isServing, skipCordovaBuild = false) {
    let validators = [];

    validators.push(
      new AllowNavigation({
        project: this.project,
        rejectIfUndefined: isServing
      }).run()
    );

    if (this.platform === 'ios') {
      let validation = new ValidateSigningIdentity({
        project: this.project,
        buildConfigName: this.cordovaOpts.release ? 'release' : 'debug',
        logLevel: 'warn'
      });

      validators.push(validation.run());

      // build command will inspect this to show message after error code 65
      this.signingIdentityValidation = validation;
    }

    return validators;
  },

  validateBuild(skipCordovaBuild) {
    let validators = this._buildValidators(false, skipCordovaBuild);

    return runValidators(validators);
  },

  validateServe() {
    let validators = this._buildValidators(true);

    return runValidators(validators);
  },

  build() {
    let cordovaBuild = new Build({
      project: this.project,
      platform: this.platform,
      cordovaOpts: this.cordovaOpts,
      browserify: this.browserify
    });

    return cordovaBuild.run();
  }
});
