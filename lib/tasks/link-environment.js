'use strict';

var Task        = require('ember-cli/lib/models/task');
var Promise     = require('ember-cli/lib/ext/promise');
var DistTask    = require('./verify-dist');

var cordovaPath = require('../utils/cordova-path');
var fs          = require('fs-extra');
var path        = require('path');
var chalk       = require('chalk');


module.exports = Task.extend({
  run: function() {
    if(!this.project) {
      throw new Error('A project must be passed into this function');
    }

    var verifyDist = new DistTask({
      project: this.project
    });
    verifyDist.run();

    var wwwPath = path.join(cordovaPath(this.project), 'www');
    var distPath = path.join(this.project.root, 'dist');
    fs.removeSync(wwwPath);
    fs.ensureSymlinkSync(distPath, wwwPath, 'dir');

    this.ui.writeLine("Symlinked dist/ to cordova/wwww");
    return Promise.resolve();
  }
});
