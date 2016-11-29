'use strict';

var BashTask        = require('../../../lib/tasks/bash');
var VerifyInstall   = require('../../../lib/tasks/validate/cordova-installed');
var CordovaCmd      = require('../../../lib/commands/cordova');
var logger          = require('../../../lib/utils/logger');


var td              = require('testdouble');
var Promise         = require('ember-cli/lib/ext/promise');

var mockProject     = require('../../fixtures/ember-cordova-mock/project');
var mockAnalytics   = require('../../fixtures/ember-cordova-mock/analytics');
var isObject        = td.matchers.isA(Object);
var contains        = td.matchers.contains;

describe('Cordova Command', function() {
  var setupCmd = function() {
    td.replace(VerifyInstall.prototype, 'run', function() {
      return Promise.resolve();
    });

    var cmd = new CordovaCmd({
      project: mockProject.project,
      ui: mockProject.ui
    });
    cmd.analytics = mockAnalytics;

    return cmd;
  };

  afterEach(function() {
    td.reset();
  });

  it('warns if an ember-cordova command is used', function() {
    var logDouble = td.replace(logger, 'warn');
    var cmd = setupCmd();

    td.replace(cmd, 'run', function() {
      return Promise.resolve();
    });

    return cmd.validateAndRun(['build']).then(function() {
      td.verify(logDouble(contains('bypassed ember-cordova command')));
    });
  });

  it('warns if cordova command is unknown', function() {
    var logDouble = td.replace(logger, 'warn');
    var cmd = setupCmd();

    td.replace(cmd, 'run', function() {
      return Promise.resolve();
    });

    return cmd.validateAndRun(['foo']).then(function() {
      td.verify(logDouble(contains('unknown Cordova command')));
    });
  });

  it('proxies argument commands', function(done) {
    var bashDouble = td.replace(BashTask.prototype, 'runCommand');
    var cmd = setupCmd();

    cmd.validateAndRun(['plugin add foo']).then(function() {
      td.verify(bashDouble('cordova plugin add foo', isObject));
      done();
    }).catch(function(err) {
      done(err);
    });
  });
});
