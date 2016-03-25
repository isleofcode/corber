export function initialize(container) {
  var platform = container.lookup('service:device/platform');

  if (platform.get('isWebView')) {
    document.addEventListener('deviceready', function() {
      platform.set('isReady', true);
    });
  } else {
    platform.set('isReady', true);
  }
}

export default {
  name: 'cordova-ready',
  initialize: initialize
};
