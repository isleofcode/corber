var Task            = require('./-task');

var path            = require('path');
var fsUtils         = require('../utils/fs-utils');
var logger          = require('../utils/logger');

/* eslint-disable camelcase */

module.exports = Task.extend({
  project: undefined,

  run: function() {
    var project = this.project;
    logger.info('ember-cordova: updating .watchmanconfig');

    var configPath = path.join(project.root, '.watchmanconfig')

    return fsUtils.read(configPath, { encoding: 'utf8' })
      .then(function(config) {
        var json = JSON.parse(config);
        var ignored;

        if (json.ignore_dirs) {
          ignored = json.ignore_dirs;
          ignored.push('ember-cordova');
        } else {
          ignored = ['ember-cordova'];
        }
        json.ignore_dirs = ignored;

        var contents = JSON.stringify(json);

        return fsUtils.write(configPath, contents, 'utf8').then(function() {
          logger.success('Added ember-cordova to watchman ignore');
        });
      }, function(err) {
        logger.error(
          'ember-cordova: failed to update .watchmanconfig, err: ' + err
        );
      });
  }
});
