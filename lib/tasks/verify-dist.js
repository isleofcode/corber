'use strict';

var Task        = require('ember-cli/lib/models/task');
var Promise     = require('ember-cli/lib/ext/promise');

var path       = require('path');
var fs         = require('fs');

module.exports = Task.extend({
  run: function() {
    var distPath = path.join(this.project.root, 'dist');

    if (fs.existsSync(distPath)) {
      return Promise.resolve();
    } else {
      fs.mkdirSync(distPath);

      return Promise.resolve();
    }
  }
});
