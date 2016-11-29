var Task            = require('../-task');
var Promise         = require('ember-cli/lib/ext/promise');

var logger          = require('../../utils/logger');
var getLastCommandRun = require('../../utils/get-last-command');

var MUST_SPECIFY_HASH =
  'Cordova applications require that you ' +
  'specify\n`ENV.locationType = \'hash\';` ' +
  'in config/environment.js\n\n' +
  'Please make this change and then rerun `' +
  getLastCommandRun() + '`\n';

module.exports = Task.extend({
  project: undefined,

  run: function(config) {
    var locationType    = config.locationType;
    var isHashLocation  = locationType === 'hash';

    if (!isHashLocation) {
      logger.error(MUST_SPECIFY_HASH);
    }

    return Promise.resolve();
  }
});
