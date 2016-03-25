import Ember from 'ember';

var computed = Ember.computed;

var IOS = 'ios';
var ANDROID = 'android';
var WINDOWS_PHONE = 'windowsphone';
var EDGE = 'edge';
var CROSSWALK = 'crosswalk';

/*

 Heavily borrowed from the Ionic Platform implementation,
 and re-purposed for ember-cordova applications.

 Source: https://github.com/driftyco/ionic/blob/master/js/utils/platform.js

*/

export default Ember.Service.extend({
  navigator: window.navigator,
  ua: navigator.userAgent,
  deviceReady: false,

  /**
   * @returns {Array(string)} An array of all platforms found.
   */
  platforms: [],

  init() {
    this._super(...arguments);
    this._setPlatforms();
  },

  /*
   * @returns {boolean} Check if we are running within a WebView (such as Cordova).
   */
  isWebView: computed(function() {
    return !(
      !window.cordova &&
      !window.PhoneGap &&
      !window.phonegap &&
      window.forge !== 'object'
    );
  }),

  /**
   * @returns {boolean} Whether we are running on iPad.
   */
  isIPad: computed(function() {
    if (/iPad/i.test(window.navigator.platform)) {
      return true;
    }
    return /iPad/i.test(window.ua);
  }),

  /**
   * @returns {boolean} Whether we are running on iOS.
   */
  isIOS: computed(function() {
    return this.is(IOS);
  }),

  /**
   * @returns {boolean} Whether we are running on Android.
   */
  isAndroid: computed(function() {
    return this.is(ANDROID);
  }),

  /**
   * @returns {boolean} Whether we are running on Windows Phone.
   */
  isWindowsPhone: computed(function() {
    return this.is(WINDOWS_PHONE);
  }),

  /**
   * @returns {boolean} Whether we are running on MS Edge/Windows 10 (inc. Phone)
   */
  isEdge: computed(function() {
    return this.is(EDGE);
  }),

  /**
   * @returns {boolean} Whether we are running on Crosswalk
   */
  isCrosswalk: computed(function() {
    return this.is(CROSSWALK);
  }),

  /**
   * @returns {string} The name of the current platform.
   */
  platform: Ember.computed(function() {
    var ua = this.get('ua');
    var platformName;

    if (ua.indexOf('Edge') > -1) {
      platformName = EDGE;
    } else if (ua.indexOf('Windows Phone') > -1) {
      platformName = WINDOWS_PHONE;
    } else if (ua.indexOf('Android') > 0) {
      platformName = ANDROID;
    } else if (/iPhone|iPad|iPod/.test(ua)) {
      platformName = IOS;
    } else {
      var navPlatform = navigator.platform;
      if (navPlatform) {
        platformName = navigator.platform.toLowerCase().split(' ')[0];
      } else {
        platformName =  '';
      }
    }

    return platformName;
  }),

  /**
   * @returns {number} The version of the current device platform.
   */
  version: computed(function() {
    var v = this.get('device.version');

    if (!v) {
      return undefined;
    }

    v = parseFloat(v[0] + '.' + (v.length > 1 ? v[1] : 0));
    if (!isNaN(v)) {
      return v;
    }
  }),

  /**
   * @returns {object} The device object.
   */
  device: computed(function() {
    return window.device || {};
  }),

  /**
   * @param {string} Platform name.
   * @returns {boolean} Whether the platform name provided is detected.
   */
  is: function(type) {
    type = type.toLowerCase();
    // check if it has an array of platforms
    var platforms = this.get('platforms');
    if (platforms) {
      for (var x = 0; x < platforms.length; x++) {
        if (platforms[x] === type) return true;
      }
    }
    // exact match
    var pName = this.get('platform');
    if (pName) {
      return pName === type.toLowerCase();
    }

    // A quick hack for to check userAgent
    return this.get('ua').toLowerCase().indexOf(type) >= 0;
  },

  _setPlatforms() {
    var _this     = this,
        platforms = [];

    if (_this.get('isWebView')) {
      platforms.push('webview');
      if (!(!window.cordova && !window.PhoneGap && !window.phonegap)) {
        platforms.push('cordova');
      } else if (typeof window.forge === 'object') {
        platforms.push('trigger');
      }
    } else {
      platforms.push('browser');
    }

    if (_this.get('isIPad')) {
      platforms.push('ipad')
    };

    var platform = _this.get('platform');

    if (platform) {
      platforms.push(platform);

      var version = _this.get('version');
      if (version) {
        var v = version.toString();
        if (v.indexOf('.') > 0) {
          v = v.replace('.', '_');
        } else {
          v += '_0';
        }
        platforms.push(platform + v.split('_')[0]);
        platforms.push(platform + v);
      }
    }

    _this.set('platforms', platforms);
  },
});
