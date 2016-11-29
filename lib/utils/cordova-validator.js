'use strict';

var getCordovaConfig = require('./get-cordova-config');
var getCordovaPath   = require('./cordova-path');
var fsUtils          = require('./fs-utils');
var logger           = require('./logger');

var Promise          = require('ember-cli/lib/ext/promise');
var path             = require('path');

var NOT_IN_CONFIGXML = 'Not found in config.xml. ';
var NOT_IN_FETCHJSON = 'Not found in fetch.json. ';
var NOT_IN_DIR       = 'Dir not found. ';
var NOT_IN_PLATFORMJSON = 'Not found in platform.json. ';

var nameIsMatch = function(node, name) {
  return node.$.name === name;
};

var isArray = function(v) {
  return Object.prototype.toString.call(v) === '[object Array]';
};

//type == platform || plugin
//name == 'ios', 'android', 'cordova-plugin-camera'
var hasByName = function(json, name, type) {
  if (json && json.widget) {
    var nodes = json.widget[type];

    if (!!nodes && isArray(nodes)) {
      for (var i = 0; i < nodes.length; i++) {
        if (nameIsMatch(nodes[i], name)) {
          return true;
        }
      }
    }
  }

  return false;
};

function CordovaValidator(opts) {
  this.project = opts.project;
  this.desiredKeyName = opts.desiredKeyName;
  this.platform = opts.platform;
  this.type = opts.type;
  this.dir = opts.dir;
  this.jsonPath = opts.jsonPath;
}

/* eslint-disable max-len */
CordovaValidator.prototype.throwError = function(error) {
  var message = 'Expected a cordova ' + this.type + ' to be installed that was not: ';
  message += this.desiredKeyName   + ': ' + error;
  message += 'You probably need to run ember cdv:' + this.type + ' add ' + this.desiredKeyName + '.';
  logger.error(message);
};
/* eslint-enable max-len */

CordovaValidator.prototype.validateCordovaConfig = function() {
  var validator = this;
  return new Promise(function(resolve, reject) {
    getCordovaConfig(validator.project).then(function(cordovaConfig) {
      if (!hasByName(cordovaConfig, validator.desiredKeyName, validator.type)) {
        reject();
        validator.throwError(NOT_IN_CONFIGXML);
      } else {
        resolve();
      }
    });
  });
};

CordovaValidator.prototype.validateCordovaJSON = function() {
  var validator = this;
  return new Promise(function(resolve, reject) {
    var cordovaPath = getCordovaPath(validator.project);
    var fetchPath = path.join(cordovaPath, validator.jsonPath);

    try {
      var fetchJSON = require(fetchPath);
      var items = Object.keys(fetchJSON);

      if (items.indexOf(validator.desiredKeyName) < 0) {
        reject();
        validator.throwError(NOT_IN_FETCHJSON);
      }
      resolve();
    } catch (e) {
      reject();
      validator.throwError(NOT_IN_FETCHJSON);
    }
  });
};

//Is only run for plugins, there is no equivalent for platform
CordovaValidator.prototype.validatePluginJSON = function() {
  var validator = this;
  return new Promise(function(resolve, reject) {
    var cordovaPath = getCordovaPath(validator.project);
    var platformPath = path.join(
      cordovaPath,
      'plugins/' + validator.platform + '.json'
    );

    try {
      var platformJSON = require(platformPath);
      var plugins = Object.keys(platformJSON.installed_plugins);

      if (plugins.indexOf(validator.desiredKeyName) < 0) {
        reject();
        validator.throwError(NOT_IN_PLATFORMJSON);
      }
      resolve();
    } catch (e) {
      reject();
      validator.throwError(NOT_IN_PLATFORMJSON);
    }
  });
};

CordovaValidator.prototype.validateDirExists = function() {
  var validator = this;
  return new Promise(function(resolve, reject) {
    var cordovaPath = getCordovaPath(validator.project);
    var filePath = path.join(
      cordovaPath,
      validator.dir,
      validator.desiredKeyName
    );

    if (fsUtils.existsSync(filePath)) {
      resolve();
    } else {
      reject();
      validator.throwError(NOT_IN_DIR);
    }
  });
};

module.exports = CordovaValidator;
