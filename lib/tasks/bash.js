'use strict';

var Task            = require('ember-cli/lib/models/task');
var PromiseExt      = require('ember-cli/lib/ext/promise');

var childProcess    = require('child_process');
var defaults        = require('lodash').defaults;

var BashTask = Task.extend({
  command: undefined,

  run: function() {
    var command     = this.command,
        _options    = this.options || {},
        options     = defaults(_options, {
          maxBuffer: 5000 * 1024,
          stdio: 'inherit'
        });

    return this.runCommand(command, options);
  }
});

BashTask.prototype.runCommand = function(command, options) {
  var execPromise = PromiseExt.denodeify(childProcess.exec);
  return execPromise(command, options);
};

module.exports = BashTask;
