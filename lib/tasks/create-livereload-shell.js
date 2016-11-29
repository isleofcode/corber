'use strict';

var Task            = require('./-task');
var getNetworkIp    = require('../utils/get-network-ip');

var cordovaPath     = require('../utils/cordova-path');
var fsUtils         = require('../utils/fs-utils');
var logger          = require('../utils/logger');

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

  run: function(port, reloadUrl) {
    return this.getShellTemplate().then(function(html) {
      var outputPath = path.join(cordovaPath(this.project), 'www/index.html');
      if (reloadUrl === undefined) {
        //Replace {{liveReloadUrl}} with address
        var networkAddress = getNetworkIp();
        reloadUrl = 'http://' + networkAddress + ':' + port;
      }

      html = html.replace(new RegExp('{{liveReloadUrl}}', 'gi'), reloadUrl);

      return fsUtils.write(outputPath, html, 'utf8');
    }.bind(this)).catch(function(err) {
      logger.error(
        'Error moving index.html for livereload ' + err
      );
    });
  }
});

