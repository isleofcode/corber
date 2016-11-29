'use strict';

var td              = require('testdouble');
var cordovaAssets   = require('../../../lib/utils/cordova-assets');
var expect          = require('../../helpers/expect');
var fsUtils         = require('../../../lib/utils/fs-utils');
var logger          = require('../../../lib/utils/logger');
var contains        = td.matchers.contains;

describe('Get Platform Assets Util', function() {
  describe('getPaths', function() {
    it('is valid for ios', function() {
      var assets = cordovaAssets.getPaths('ios', 'fakeProjectPath');
      var expectedPath = 'platforms/ios/www';
      expect(assets.assetsPath).to.equal(expectedPath);
    });

    it('is valid for android', function() {
      var assets = cordovaAssets.getPaths('android', 'fakeProjectPath');
      var expectedPath = 'platforms/android/assets/www';
      expect(assets.assetsPath).to.equal(expectedPath);
    });

    it('is valid for browser', function() {
      var assets = cordovaAssets.getPaths('browser', 'fakeProjectPath');
      var expectedPath = 'platforms/browser/www';
      expect(assets.assetsPath).to.equal(expectedPath);
    });

    it('adds cordova_plugins.js to files', function() {
      var assets = cordovaAssets.getPaths('ios', 'fakeProjectPath');
      expect(assets.files).to.deep.equal(['cordova_plugins.js', 'cordova.js']);
    });
  });

  describe('validatePaths', function() {
    it('throws an error if assetsPath is undefined', function() {
      expect(function() {
        cordovaAssets.validatePaths();
      }).to.throw(
        'ember-cordova: Platform asset path undefined, cant build'
      );
    });

    it('throws an error if cordova.js does not exist', function() {
      td.replace(fsUtils, 'existsSync', function(path) {
        return path !== 'path/cordova.js'
      });

      var warnDouble = td.replace(logger, 'warn');
      cordovaAssets.validatePaths('fakeAssetPath', 'fakeProjectPath');

      td.verify(warnDouble(contains('Did not find')));
      td.verify(warnDouble(contains('cordova.js')));
    });

    it('throws an error if cordova_plugins.js does not exist', function() {
      td.replace(fsUtils, 'existsSync', function(path) {
        return path !== 'path/cordova_plugins.js'
      });

      var warnDouble = td.replace(logger, 'warn');
      cordovaAssets.validatePaths('fakeAssetPath', 'fakeProjectPath');

      td.verify(warnDouble(contains('Did not find')));
      td.verify(warnDouble(contains('cordova_plugins.js')));
    });
  });
});
