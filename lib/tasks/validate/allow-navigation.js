var Task            = require('../-task');
var Promise         = require('ember-cli/lib/ext/promise');
var chalk           = require('chalk');
var logger          = require('../../utils/logger');
var getCordovaConfig = require('../../utils/get-cordova-config');

var UNSAFE_PRODUCTION_VALUE =
  chalk.yellow('Your ember-cordova/cordova/config.xml file has set the' +
    'following flag:\n') +
  chalk.grey('\t<allow-navigation href="${allowNavigation}" />\n') +
  chalk.yellow('This is necessary for device live-reload to work,\n' +
    'but is unsafe and should not be used in production.\n');

var LIVE_RELOAD_CONFIG_NEEDED =
  chalk.red('* ember-cordova/cordova/config.xml needs: \n') +
  chalk.grey('<allow-navigation href="*" />\n') +
  chalk.grey('This is unsafe and should not be used in production,\n' +
    'but is necessary for device live-reload to work.\n');

/*
 * allow-navigation is considered unsafe when:
 *
 * there is a allow-href that consists of '*'
 * or one that contains a http or https url
 *
 * pending a users setup, one of these will be present for liveReload
 *
 */

//this is wrong because user may have multiple allow-hrefs
function livereloadProp(json, field, prop) {
  if (json && json[field]) {

    var keysLength = json[field].length;
    while (keysLength--) {
      var value = json[field][keysLength].$[prop];
      if (value && this.validateNavigationProp(value) !== undefined) {
        return value
      }
    }
  }
  return undefined;
}

function validateNavigationProp(prop) {
  if (prop &&
       (prop.indexOf('*') === 0 ||
        prop.indexOf('http') > -1 ||
        prop.indexOf('https') > -1)
      ) {

    return prop;
  }
}

module.exports = Task.extend({
  project: undefined,
  platform: undefined,
  rejectIfUndefined: false,

  livereloadProp: livereloadProp,
  validateNavigationProp: validateNavigationProp,

  run: function() {
    if (this.platform === 'browser') {
      return Promise.resolve();
    }

    return getCordovaConfig(this.project)
      .then(function(config) {
        var livereloadProp = this.livereloadProp(
          config.widget,
          'allow-navigation',
          'href'
        );

        if (livereloadProp !== undefined) {
          var msg = UNSAFE_PRODUCTION_VALUE.replace(
            '${allowNavigation}',
            livereloadProp
          );
          logger.warn(msg);
        }

        if (this.rejectIfUndefined && livereloadProp === undefined) {
          return Promise.reject(LIVE_RELOAD_CONFIG_NEEDED);
        }
      }.bind(this));
  }
});
