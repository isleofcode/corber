var Task             = require('../-task');
var CordovaValidator = require('../../utils/cordova-validator');

module.exports = Task.extend({
  project: undefined,
  platform: undefined,

  createValidator: function() {
    return new CordovaValidator({
      project: this.project,
      platform: this.platform,
      desiredKeyName  : this.platform,
      type: 'platform',
      dir: 'platforms/',
      jsonPath: 'platforms/platforms.json'
    });
  },

  run: function() {
    var validator = this.createValidator();

    return validator.validateCordovaConfig()
      .then(validator.validateCordovaJSON.bind(validator))
      .then(validator.validateDirExists.bind(validator));
  }
});
