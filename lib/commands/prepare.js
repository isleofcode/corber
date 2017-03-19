'use strict';

var Command         = require('./-command');
var PrepareTask     = require('../tasks/prepare');
var HookTask        = require('../tasks/run-hook');
var logger          = require('../utils/logger');

module.exports = Command.extend({
  name: 'cordova:prepare',
  aliases: ['cdv:prepare'],
  description: 'Runs cordova prepare and ember cdv link',
  works: 'insideProject',

  run: function(options) {
    this._super.apply(this, arguments);

    var prepare = new PrepareTask({
      project: this.project,
      verbose: options.verbose
    });

    var hook = new HookTask({
      project: this.project
    });

    return hook.run('beforePrepare', options)
      .then(prepare.prepare())
      .then(hook.prepare('afterPrepare', options))
      .catch(function(err) {
        logger.error(err);
      });
  }
});
