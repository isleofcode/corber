var path            = require('path');
var logger          = require('./logger');
var existsSync      = require('./fs-utils').existsSync;

module.exports = {
  getPaths: function(platform, projectPath) {
    var platformsPath = 'platforms';
    var assetsPath;

    if (platform === 'ios') {
      assetsPath = path.join(platformsPath, 'ios', 'www');
    } else if (platform === 'android') {
      assetsPath = path.join(platformsPath, 'android', 'assets', 'www');
    } else if (platform === 'browser') {
      assetsPath = path.join(platformsPath, 'browser', 'www');
    }

    var files = ['cordova_plugins.js', 'cordova.js'];

    var pluginPath = path.join(projectPath, assetsPath, 'plugins');
    if (existsSync(pluginPath)) {
      files.push('plugins/**');
    }

    return {
      assetsPath: assetsPath,
      files: files
    }
  },

  /* eslint-disable max-len */
  validatePaths: function(assetsPath, projectPath) {
    if (assetsPath === undefined) {
      throw new Error('ember-cordova: Platform asset path undefined, cant build');
    }

    var platformPath = path.join(projectPath, assetsPath, 'cordova.js');
    var pluginPath = path.join(projectPath, assetsPath, 'cordova_plugins.js');

    if (!existsSync(platformPath) || !existsSync(pluginPath)) {
      logger.warn(
        'Did not find cordova.js or cordova_plugins.js at ' +
        assetsPath +
        '. Ember App LiveReload will still work, but device & plugin APIS will fail.'
      );
    }
  }
  /* eslint-enable max-len */
};
