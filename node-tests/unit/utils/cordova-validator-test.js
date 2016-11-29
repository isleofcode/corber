'use strict';

var expect          = require('../../helpers/expect');
var td              = require('testdouble');
var fsUtils         = require('../../../lib/utils/fs-utils');

var mockProject     = require('../../fixtures/ember-cordova-mock/project');
var CordovaValidator = require('../../../lib/utils/cordova-validator');

describe('Cordova Validator', function() {
  var validator;

  beforeEach(function() {
    td.replace(CordovaValidator.prototype, 'throwError');

    validator = new CordovaValidator({
      project: mockProject.project,
      platform: 'ios',
      desiredKeyName  : 'cordova-test-plugin',
      type: 'plugin',
      dir: 'plugins/',
      jsonPath: 'plugins/fetch.json'
    });
  });

  afterEach(function() {
    td.reset();
  });

  context('validateCordovaConfig', function() {
    it('fulfills when config.xml holds the key', function() {
      return expect(
        validator.validateCordovaConfig()
      ).to.eventually.be.fulfilled;
    });

    it('rejects when config.xml does not hold the key', function() {
      validator.desiredKeyName = 'i-dont-exist';
      return expect(
        validator.validateCordovaConfig()
      ).to.eventually.be.rejected;
    });
  });

  context('validateCordovaJSON', function() {
    it('fulfills when key is in json file', function() {
      return expect(validator.validateCordovaJSON()).to.eventually.be.fulfilled;
    });

    it('rejects when key is not in json file', function() {
      validator.desiredKeyName = 'i-dont-exist';
      return expect(validator.validateCordovaJSON()).to.eventually.be.rejected;
    });
  });

  context('validatePluginJSON', function() {
    it('fulfills when key is in plugin json file', function() {
      return expect(validator.validatePluginJSON()).to.eventually.be.fulfilled;
    });

    it('rejects when key is not in plugin json file', function() {
      validator.desiredKeyName = 'i-dont-exist';
      return expect(validator.validatePluginJSON()).to.eventually.be.rejected;
    });
  });

  context('validateDirExists', function() {
    it('fulfills when plugin dir exists', function() {
      td.replace(fsUtils, 'existsSync', function() {
        return true;
      });

      return expect(validator.validateDirExists()).to.eventually.be.fulfilled;
    });

    it('rejects when plugin dir does not exist', function() {
      td.replace(fsUtils, 'existsSync', function() {
        return false;
      });

      return expect(validator.validateDirExists()).to.eventually.be.rejected;
    });
  });
});

