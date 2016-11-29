'use strict';

var Command         = require('./-command');
var SplashTask      = require('splicon/dist/splash-task');
var logger          = require('../utils/logger');

module.exports = Command.extend({
  name: 'cordova:make-splashes',
  aliases: ['cordova:splashes', 'cdv:splash', 'cdv:make-splashes'],
  description: 'Generates cordova splash files and updates config',
  works: 'insideProject',

  availableOptions: [{
    name: 'source',
    type: String,
    default: 'ember-cordova/splash.svg'
  }, {
    name: 'platform',
    type: Array,
    default: ['all']
  }],

  run: function(options) {
    this._super.apply(this, arguments);

    logger.info('ember-cordova: generating-splashes');

    return new SplashTask({
      source: options.source,
      platforms: options.platform,
      projectPath: 'ember-cordova/cordova'
    }).then(function() {
      logger.success('ember-cordova: splashes generated');
    }).catch(function(err) {
      logger.error(err);
    });
  }
});
