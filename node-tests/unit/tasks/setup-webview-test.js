'use strict';

var td              = require('testdouble');
var isAnything      = td.matchers.anything();
var logger          = require('../../../lib/utils/logger');

var CdvRawTask      = require('../../../lib/tasks/cordova-raw');
var SetupViewTask   = require('../../../lib/tasks/setup-webview');
var mockProject     = require('../../fixtures/ember-cordova-mock/project');
var contains        = td.matchers.contains;


describe('Setup Webview Task', function() {
  var rawDouble, setupTask;

  beforeEach(function() {
    rawDouble = td.replace(CdvRawTask.prototype, 'run');

    setupTask = new SetupViewTask({
      project: mockProject.project,
      ui: mockProject.ui,
      platform: 'ios'
    });
  });

  afterEach(function() {
    td.reset();
  });

  it('runs a corodva raw task to install plugins', function() {
    setupTask.run();
    td.verify(rawDouble(isAnything, isAnything, isAnything));
  });

  it('warns the user & alerts them of install', function() {
    var warnDouble = td.replace(logger, 'warn');
    var successDouble = td.replace(logger, 'success');

    setupTask.run();
    td.verify(warnDouble(contains(
      'ember-cordova initializes with upgraded WebViews.'
    )));

    td.verify(successDouble(contains(
      'Initializing cordova with upgraded WebView'
    )));
  });

  it('uses cordova-plugin-wkwebview-engine for ios', function() {
    setupTask.run();
    td.verify(rawDouble('add', 'cordova-plugin-wkwebview-engine', isAnything));
  });

  it('uses cordova-plugin-crosswalk-webview for android', function() {
    setupTask.platform = 'android';
    setupTask.run();
    td.verify(rawDouble('add', 'cordova-plugin-crosswalk-webview', isAnything));
  });
});
