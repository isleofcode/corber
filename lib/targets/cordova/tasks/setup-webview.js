const Task             = require('../../../tasks/-task');
const CordovaRaw       = require('../../../targets/cordova/tasks/raw');
const logger           = require('../../../utils/logger');
const Promise          = require('rsvp').Promise;

module.exports = Task.extend({
  project: undefined,
  platform: undefined,
  uiwebview: false,
  crosswalk: false,

  warnPlatform(platform, view) {
    logger.warn(
      'You have specified platform=' + platform + ' and ' + view + '.' +
      'Crosswalk is only available on android. This will have no effect.'
    );
  },

  warnIosView() {
    logger.warn(
      'corber initializes ios with the upgraded WKWebView. ' +
      'See http://corber.io/pages/default_webviews for details and flags'
    );
  },

  run() {
    let viewName, upgradeWebView;

    upgradeWebView = new CordovaRaw({
      project: this.project,
      api: 'plugins'
    });

    if (this.platform === 'ios') {
      if (this.crosswalk === true) {
        this.warnPlatform('ios', 'crosswalk=true');
      } else if (this.uiwebview === false) {
        this.warnIosView();
        viewName = 'cordova-plugin-wkwebview-engine';
      }
    } else if (this.platform === 'android') {
      if (this.uiwebview === true) {
        this.warnPlatform('android', 'uiwebview=true');
      } else if (this.crosswalk === true) {
        viewName = 'cordova-plugin-crosswalk-webview';
      }
    }

    logger.success(
      'Initializing cordova with upgraded WebView ' + viewName
    );

    if (viewName !== undefined) {
      return upgradeWebView.run('add', viewName, { save: true });
    } else {
      return Promise.resolve();
    }
  }
});
