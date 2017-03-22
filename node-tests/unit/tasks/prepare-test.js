'use strict';

var td              = require('testdouble');
var mockProject     = require('../../fixtures/ember-cordova-mock/project');
var CdvRawTask      = require('../../../lib/tasks/cordova-raw');

var setupPrepareTask = function() {
  var PrepareTask = require('../../../lib/tasks/prepare');
  return new PrepareTask(mockProject);
};

describe('Prepare Task', function() {
  afterEach(function() {
    td.reset();
  });

  it('runs cordova prepare', function() {
    var rawDouble = td.replace(CdvRawTask.prototype, 'run');
    var prepare = setupPrepareTask();
    prepare.run();

    td.verify(rawDouble());
  });
});
