'use strict';

var logger          = require('../utils/logger');

var LINK_DEPRECATION =
  '\n\tDEPRECATED\n\t--------------\n' +
  '\t`cordova:link` and alias `cdv:link` have been deprecated because\n' +
  '\ttheir behavior is no longer utilized by `ember-cordova` since assets\n'  +
  '\tare now built directly into the cordova/www folder.\n';

module.exports = {
  name: 'cordova:link',
  aliases: ['cdv:link'],
  description: '[DEPRECATED] symlink dist to cordova/www',
  works: 'insideProject',

  run: function() {
    logger.error(LINK_DEPRECATION);
  }
};
