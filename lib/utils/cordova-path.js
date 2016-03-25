'use strict';

var path       = require('path');

module.exports = function defaultPlatform(project, excludeCordova) {
  var cdvPath = path.join(project.root, 'ember-cordova');
  if (excludeCordova) {
    return cdvPath;
  } else {
    return path.join(cdvPath, 'cordova');
  }
};
