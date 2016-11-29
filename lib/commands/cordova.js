'use strict';

var Command         = require('./-command');

var BashTask        = require('../tasks/bash');
var cordovaPath     = require('../utils/cordova-path');
var logger          = require('../utils/logger');

var ValidateCordova = require('../tasks/validate/cordova-installed');

module.exports = Command.extend({
  name: 'cordova',
  aliases: ['cdv'],
  description: 'Passes commands to Cordova CLI',
  works: 'insideProject',

  supportedCommands: [
    'build',
    'platform',
    'platforms',
    'plugin',
    'plugins',
    'prepare'
  ],

  knownCordovaCommands: [
    'run',
    'emulate'
  ],

  validateAndRun: function(rawArgs) {
    var warning;

    if (this.supportedCommands.indexOf(rawArgs[0]) >= 0) {
      warning = rawArgs +
        ' run in cordova, but bypassed ember-cordova command.' +
        ' Consider running ember cdv:' + rawArgs + ' instead';

    } else if (this.knownCordovaCommands.indexOf(rawArgs[0]) === -1) {
      warning = rawArgs +
        ' passed to Cordova, but is an unknown Cordova command';

    }

    if (warning !== undefined) {
      logger.warn(warning);
    }

    return this.run({}, rawArgs);
  },

  run: function(options, rawArgs) {
    this._super.apply(this, arguments);

    var project = this.project;

    var isInstalled = new ValidateCordova({
      project: project
    });

    return isInstalled.run().then(function() {
      var joinedArgs = rawArgs.join(' ');
      var cdvCommand = 'cordova ' + joinedArgs;

      var msg = 'Running \'cordova ' + joinedArgs + '\'';
      logger.success(msg);

      return new BashTask({
        command: cdvCommand,
        options: {
          cwd: cordovaPath(project)
        }
      }).run();
    }).catch(function(e) {
      logger.error(e);
    });
  }
});
