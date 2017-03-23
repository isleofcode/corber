'use strict';

var Task            = require('../-task');
var Promise         = require('ember-cli/lib/ext/promise');
var chalk           = require('chalk');
var pick            = require('lodash').pick;
var values          = require('lodash').values;

var logger          = require('../../utils/logger');

/* eslint-disable max-len */
var URL_MSG =
  chalk.red('* config/environment.js: rootURL or baseURL has a leading slash. \n') +
  chalk.grey(
    'This will not work in cordova, and needs to be removed. \n' +
    'You can pass the --force flag to ignore if otherwise handled. \n' +
    'See http://embercordova.com/pages/setup_guide for more info.'
  )
/* eslint-enable max-len */

module.exports = Task.extend({
  config: undefined,
  force: false,

  validRootValues: function(values) {
    for (var i = 0; i < values.length; i++) {
      var value = values[i];
      if (value && value[0] === '/') { return false; }
    }

    return true;
  },

  run: function() {
    var rootProps = ['baseURL', 'rootURL', 'baseUrl', 'rootUrl'];
    var rootValues = values(pick(this.config, rootProps));
    var validRoot = this.validRootValues(rootValues);

    if (validRoot === false) {
      if (this.force === true) {
        var msg = URL_MSG + 'You have passed the --force flag, so continuing';
        logger.warn(msg);
        return Promise.resolve();
      } else {
        return Promise.reject(URL_MSG);
      }
    } else {
      return Promise.resolve();
    }
  }
});
