'use strict';

var td              = require('testdouble');
var Promise         = require('ember-cli/lib/ext/promise');
var mockProject     = require('../../fixtures/ember-cordova-mock/project');
var fsUtils         = require('../../../lib/utils/fs-utils');

var expect          = require('../../helpers/expect');
var contains        = td.matchers.contains;
var isString        = td.matchers.isA(String);
var isObject        = td.matchers.isA(Object);

var setupTask = function(shouldMockTemplate) {
  var CreateShell = require('../../../lib/tasks/create-livereload-shell');

  var shellTask = new CreateShell({
    project: mockProject.project,
    ui: mockProject.ui
  });

  if (shouldMockTemplate) {
    td.replace(CreateShell.prototype, 'getShellTemplate', function() {
      return Promise.resolve('{{liveReloadUrl}}');
    });
  }

  return shellTask;
};

describe('Create Cordova Shell Task', function() {
  var writeDouble;

  beforeEach(function() {
    writeDouble = td.replace(fsUtils, 'write');
  });

  afterEach(function() {
    td.reset();
  });

  describe('getShellTemplate', function() {
    it('reads the right path', function() {
      var shellTask = setupTask();
      var readDouble = td.replace(fsUtils, 'read');

      shellTask.getShellTemplate();
      td.verify(readDouble(
        contains('templates/livereload-shell/index.html'),
        isObject
      ));
    });
  });

  it('attempts to get shell template', function() {
    var shellTask = setupTask();
    var called = false;

    td.replace(shellTask, 'getShellTemplate', function() {
      called = true;
      return Promise.resolve();
    });

    shellTask.run();
    expect(called).to.equal(true);
  });

  it('replaces {{liveReloadUrl}} and saves', function() {
    var shellTask = setupTask(true);

    return shellTask.run(4200, 'fakeUrl').then(function() {
      td.verify(writeDouble(
        contains('cordova/www/index.html'),
        'fakeUrl',
        isString
      ));
    });
  })

  it('detects reloadUrl if one is not passed', function() {
    td.replace('../../../lib/utils/get-network-ip', function() {
      return '192.0.0.2';
    });
    var shellTask = setupTask(true);

    return shellTask.run(4200).then(function() {
      td.verify(writeDouble(
        isString,
        'http://192.0.0.2:4200',
        isString
      ));
    });
  });

  it('catches errors', function() {
    td.replace(fsUtils, 'write', function() {
      throw new Error()
    });

    var shellTask = setupTask(true);
    expect(shellTask.run()).to.eventually.throw(Error);
  });
});
