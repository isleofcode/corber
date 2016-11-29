'use strict';

var td              = require('testdouble');
var Promise         = require('ember-cli/lib/ext/promise');
var path            = require('path');

var fsUtils         = require('../../../lib/utils/fs-utils');
var logger          = require('../../../lib/utils/logger');

var cordovaProj     = require('cordova-lib').cordova;
var mockProject     = require('../../fixtures/ember-cordova-mock/project');
var isObject        = td.matchers.isA(Object);
var isString        = td.matchers.isA(String);
var contains        = td.matchers.contains;

describe('Cordova Create Task', function() {
  var create, rawDouble;

  var setupCreateTask = function() {
    //TODO - factor me out
    rawDouble = td.replace(cordovaProj.raw, 'create');

    var CreateCdvTask = require('../../../lib/tasks/create-cordova-project');
    create = new CreateCdvTask(mockProject);
  };

  beforeEach(function() {
    td.replace(fsUtils, 'mkdir', function() {
      return Promise.resolve();
    });

    td.replace(fsUtils, 'existsSync', function() {
      return false;
    });
  });

  afterEach(function() {
    td.reset();
  });

  it('creates an ember-cordova directory if one does not exist', function() {
    var expectedPath = path.resolve(
      __dirname, '..', '..',
      'fixtures',
      'ember-cordova-mock',
      'ember-cordova'
    );
    var mkDouble = td.replace(fsUtils, 'mkdir');

    setupCreateTask();

    create.run();
    td.verify(mkDouble(expectedPath));
  });

  it('calls cordova.create.raw', function() {
    setupCreateTask();
    create.run();
    td.verify(rawDouble(isString, isString, isString, {}));
  });

  it('forces camelcased ids and names', function() {
    setupCreateTask();
    create.id = 'ember-cordova-app';
    create.name = 'ember-cordova-app';

    create.run();

    /* eslint-disable max-len */
    td.verify(rawDouble(isString, 'emberCordovaApp', 'emberCordovaApp', isObject));
    /* eslint-enable max-len */
  });

  it('raises a warning if cordova project already exists', function() {
    td.replace(fsUtils, 'existsSync', function() {
      return true;
    });
    var logDouble = td.replace(logger, 'warn');

    setupCreateTask();
    return create.run().then(function() {
      td.verify(logDouble(contains('dir already exists')));
    });
  });


  it('builds with a template when provided', function() {
    setupCreateTask();
    create.run('templatePath');

    var matcher = td.matchers.contains({lib: { www: { url: 'templatePath'}}});
    td.verify(rawDouble(isString, isString, isString, matcher));
  });
});
