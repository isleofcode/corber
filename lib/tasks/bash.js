'use strict';

var Task           = require('ember-cli/lib/models/task');
var Promise        = require('ember-cli/lib/ext/promise');

//Sequence of tasks matters a lot
var spawnSync      = require('child_process').spawnSync;
var defaults       = require('lodash').defaults;

module.exports = Task.extend({
  run: function() {
    if(!this.options) {
      this.options = {};
    }

    var _this = this;
    return new Promise(function(resolve, reject) {
      var options = defaults(_this.options, {
        maxBuffer: 5000 * 1024,
        stdio: 'inherit'
      });

      var args = _this.command.split(' ');
      var command = args.shift();

      spawnSync(command, args, options);
    });
  }
});
