'use strict';

var PrepareTask     = require('../tasks/prepare');

var path            = require('path');
var chalk           = require('chalk');

module.exports = {
  name: 'cordova:prepare',
  aliases: ['cdv:prepare'],
  description: 'Runs cordova prepare and ember cdv link',
  works: 'insideProject',

  run: function(options) {
    var prepare = new PrepareTask({
      project: this.project,
      ui: this.ui
    });

    return prepare.run();
  }
};
