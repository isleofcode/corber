'use strict';

var CordovaTask     = require('../tasks/cordova');

var path            = require('path');
var chalk           = require('chalk');

module.exports = {
  name: 'cordova',
  aliases: ['cdv'],
  description: 'Passes commands to Cordova CLI',
  works: 'insideProject',

  supportedCommands: [
    'build',
    'prepare'
  ],

  knownCordovaCommands: [
    'plugin',
    'plugins',
    'platform',
    'platforms',
    'run',
    'emulate'
  ],

  validateAndRun: function(rawArgs) {
    if (this.supportedCommands.indexOf(rawArgs[0]) >= 0) {
      var warning = 'Warning: ' +
        rawArgs +
        ' run in cordova, but bypassed ember-cordova command.' +
        ' Consider running ember cdv:' + rawArgs + ' instead';

      this.ui.writeLine(chalk.yellow(warning));
    } else if (this.knownCordovaCommands.indexOf(rawArgs[0]) === -1) {
      var warning ='Warning: ' +
         rawArgs +
         ' passed to Cordova, but is an unknown Cordova command'

      this.ui.writeLine(chalk.yellow(warning));
    }

    return this.run({}, rawArgs);
  },

  run: function(options, rawArgs) {
    var cordovaCommand = new CordovaTask({
      rawArgs: rawArgs,
      project: this.project,
      ui: this.ui
    });

    return cordovaCommand.run()
  }
};
