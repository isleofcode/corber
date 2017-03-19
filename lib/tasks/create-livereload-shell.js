'use strict';

var Task            = require('./-task');
var Promise         = require('ember-cli/lib/ext/promise');
var getNetworkIp    = require('../utils/get-network-ip');

var cordovaPath     = require('../utils/cordova-path');
var fsUtils         = require('../utils/fs-utils');

var path            = require('path');

module.exports = Task.extend({
  project: undefined,

  //Read in the shell index.html file
  getShellTemplate: function() {
    var shellPath = path.join(
      __dirname,
      '../templates/livereload-shell/index.html'
    );

    return fsUtils.read(shellPath, { encoding: 'utf8' });
  },

  createShell: function(outputPath, template, reloadUrl) {
    var regExp = new RegExp('{{liveReloadUrl}}', 'gi');
    template = template.replace(regExp, reloadUrl);
    return fsUtils.write(outputPath, template, 'utf8');
  },

  run: function(port, reloadUrl) {
    var project = this.project;

    return this.getShellTemplate()
      .then(function(html) {
        var outputPath = path.join(cordovaPath(project), 'www/index.html');
        if (reloadUrl === undefined) {
          //Replace {{liveReloadUrl}} with address
          var networkAddress = getNetworkIp();
          reloadUrl = 'http://' + networkAddress + ':' + port;
        }

        return this.createShell(outputPath, html, reloadUrl)
      }.bind(this))
      .catch(function(err) {
        return Promise.reject('Error moving index.html for livereload ' + err);
      });
  }
});

