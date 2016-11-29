'use strict';

var Task            = require('./-task');
var CordovaRawTask  = require('../tasks/cordova-raw');
var logger          = require('../utils/logger');

module.exports = Task.extend({
  project: undefined,
  platform: undefined,

  run: function() {
    var viewName, upgradeWebView;

    upgradeWebView = new CordovaRawTask({
      project: this.project,
      rawApi: 'plugins'
    });

    if (this.platform === 'ios') {
      viewName = 'cordova-plugin-wkwebview-engine';
    } else if (this.platform === 'android') {
      viewName = 'cordova-plugin-crosswalk-webview';
    }

    logger.warn(
      'ember-cordova initializes with upgraded WebViews. ' +
      'See http://ember-cordova.com/pages/default_webviews for details. ' +
      'If you want default cordova views, pass --default-webview=true.'
    );

    logger.success(
      'Initializing cordova with upgraded WebView ' + viewName
    );

    return upgradeWebView.run('add', viewName, { save: true });
  }
});
