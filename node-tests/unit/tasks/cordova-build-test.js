'use strict';

var td              = require('testdouble');
var mockProject     = require('../../fixtures/ember-cordova-mock/project');
var CdvRawTask      = require('../../../lib/tasks/cordova-raw');

var setupBuildTask = function() {
  var CdvBuildTask = require('../../../lib/tasks/cordova-build');
  return new CdvBuildTask(mockProject);
};

describe('Cordova Build Task', function() {
  afterEach(function() {
    td.reset();
  });

  it('creates a raw build task', function() {
    var cdvBuild = td.replace(CdvRawTask.prototype, 'run');
    var build = setupBuildTask();
    build.platform = 'ios';
    build.run();

    td.verify(cdvBuild({platforms: ['ios'], options: []}));
  });

  it('sets platform to android', function() {
    var cdvBuild = td.replace(CdvRawTask.prototype, 'run');
    var build = setupBuildTask();
    build.platform = 'android';
    build.run();

    td.verify(cdvBuild({platforms: ['android'], options: []}));
  });
});
