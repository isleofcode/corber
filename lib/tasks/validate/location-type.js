var Task            = require('../-task');
var Promise         = require('ember-cli/lib/ext/promise');
var chalk           = require('chalk');

var MUST_SPECIFY_HASH =
  chalk.red('* config/environment.js: Cordova applications require:') +
  chalk.grey('\n`ENV.locationType = \'hash\'; \n');

module.exports = Task.extend({
  config: undefined,

  run: function() {
    var config = this.config;
    var locationType    = config.locationType;
    var isHashLocation  = locationType === 'hash';

    if (!isHashLocation) {
      return Promise.reject(MUST_SPECIFY_HASH);
    }

    return Promise.resolve();
  }
});
