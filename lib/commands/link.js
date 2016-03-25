'use strict';

var LinkTask        = require('../tasks/link-environment');

var path            = require('path');
var defaultPlatform = require('../utils/default-platform');

module.exports = {
  name: 'cordova:link',
  aliases: ['cdv:link'],
  description: 'symlink dist to cordova/www',
  works: 'insideProject',

  run: function(options) {
    var link = new LinkTask({
      project: this.project,
      ui: this.ui
    });

    return link.run();
  }
};
