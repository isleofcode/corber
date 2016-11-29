'use strict';

var Task            = require('../-task');
var Promise         = require('ember-cli/lib/ext/promise');
var chalk           = require('chalk');
var pick            = require('lodash').pick;
var values          = require('lodash').values;

var logger          = require('../../utils/logger');

var coreMsg =
  '{{rootURL}} or {{baseURL}} in app/index.html has a leading slash. \n' +
  'This will not work in cordova, and needs to be removed. \n' +
  'See $docLink for more info. \n';

module.exports = Task.extend({
  project: undefined,

  invalidIndex: function() {
    var error = chalk.red(
      'ember-cordova: Build Aborted. \n' +
      coreMsg +
      'You can pass the --force flag to ignore this if youve otherwise handled'
    );

    logger.error(error);
  },

  validRootValues: function(values) {
    for (var i = 0; i < values.length; i++) {
      var value = values[i];
      if (value[0] === '/') { return false; }
    }

    return true;
  },

  run: function(config, force) {
    return new Promise(function(resolve) {
      var rootProps = ['baseURL', 'rootURL', 'baseUrl', 'rootUrl'];
      var rootValues = values(pick(config, rootProps));
      var validRoot = this.validRootValues(rootValues);

      if (validRoot === false && force !== true) {
        return this.invalidIndex()
      } else if (validRoot === false && force === true) {
        var msg = coreMsg + 'You have passed the --force flag, so continuing';
        logger.warn(msg);
        resolve();
      } else {
        resolve();
      }
    }.bind(this));
  }
});
