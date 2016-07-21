'use strict';

var Task            = require('ember-cli/lib/models/task');
var BashTask        = require('../tasks/bash');
var PromiseExt      = require('ember-cli/lib/ext/promise');

var cordovaPath     = require('../utils/cordova-path');
var camelize        = require('../../lib/utils/string.js').camelize;
var path            = require('path');
var fs              = require('fs');
var chalk           = require('chalk');

module.exports = Task.extend({
  project: undefined,
  ui: undefined,

  id: undefined,
  name: undefined,

  run: function() {
    var emberCdvPath, id, name, cdvPath;

    emberCdvPath = cordovaPath(this.project, true);
    this.ensureOrCreatePath(emberCdvPath);

    id = camelize(this.id);
    name = camelize(this.name);

    cdvPath = path.join(emberCdvPath, 'cordova');

    if (!fs.existsSync(cdvPath)) {
      var command = 'cordova create cordova ' + id + ' ' + name;
      var create = new BashTask({
        command: command,
        options: {
          cwd: emberCdvPath
        }
      });

      return create.run();

    } else {
      this.ui.writeLine(chalk.yellow(
        'Warning: ember-cordova/cordova project already exists. ' +
        'Please ensure it is a real cordova project.'
      ));

      return PromiseExt.resolve();
    }
  },

  ensureOrCreatePath: function(_path) {
    if (!fs.existsSync(_path)) {
      this.ui.writeLine('Initting ' + path.basename(_path) + ' directory');
      fs.mkdirSync(_path);
    }
  }
});

