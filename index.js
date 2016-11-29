'use strict';

var commands              = require('./lib/commands');
var getNetworkIp          = require('./lib/utils/get-network-ip');
var cordovaPath           = require('./lib/utils/cordova-path');
var cordovaAssets         = require('./lib/utils/cordova-assets');

var mergeTrees            = require('broccoli-merge-trees');
var Funnel                = require('broccoli-funnel');

module.exports = {
  name: 'ember-cordova',

  contentFor: function(type) {
    if (this.project.targetIsCordova && type === 'body') {
      return '<script src="cordova.js"></script>';
    }
  },

  includedCommands: function() {
    return commands;
  },

  _mergeTrees: function(trees) {
    return mergeTrees(trees);
  },

  //In Livereload scenarios, we need to manually include cordova assets
  cordovaAssetTree: function(tree) {
    var platform = this.project.CORDOVA_PLATFORM;
    var projectPath = cordovaPath(this.project);
    var assets = cordovaAssets.getPaths(platform, projectPath);

    cordovaAssets.validatePaths(assets.assetsPath, projectPath);

    var pluginsTree = new Funnel('ember-cordova/cordova', {
      srcDir:  assets.assetsPath,
      include: assets.files
    });

    return this._mergeTrees([tree, pluginsTree]);
  },

  treeForPublic: function() {
    var tree = this._super.treeForPublic.apply(this, arguments);

    if (this.project.targetIsCordovaLivereload) {
      return this.cordovaAssetTree(tree);
    }

    return tree;
  }
};
