'use strict';

const td            = require('testdouble');
const expect        = require('../../helpers/expect');

const mockProject   = require('../../fixtures/ember-cordova-mock/project');
const defaults      = require('lodash').defaults;

describe('Cordova Build Task', () => {
  let commandString, buildTask;

  beforeEach(() => {
    mockBashTask();
  });

  afterEach(() => {
    td.reset();
  });

  function runBuild() {
    buildTask.run();
  }

  function mockBashTask() {
    td.replace('../../../lib/tasks/bash', function(opts) {
      commandString = opts.command;

      this.run = function() {};
    });
  }

  function mockCdvBuildTask(_options) {
    let CdvBuildTask = require('../../../lib/tasks/cordova-build'),
        options = defaults(_options, { project: mockProject.project });

    return new CdvBuildTask(options);
  }

  context('when project is undefined', () => {
    beforeEach(() => {
      let options = { project: undefined };
      buildTask = mockCdvBuildTask(options);
    });

    it('throws an error', () => {
      expect(runBuild).to.throw;
    });
  });

  context('when platform is ios', () => {
    beforeEach(() => {
      let options = { platform: 'ios' };
      buildTask = mockCdvBuildTask(options);

      runBuild();
    });

    it('generates a cordova build command', () => {
      expect(commandString).to.equal('cordova build ios');
    });
  });

  context('when platform is android', () => {
    beforeEach(() => {
      let options = { platform: 'android' };
      buildTask = mockCdvBuildTask(options);

      runBuild();
    });

    it('sets platform correctly', () => {
      expect(commandString).to.equal('cordova build android');
    });
  });

  context('when release tag is passed', () => {
    beforeEach(() => {
      let options = { isRelease: true };
      buildTask = mockCdvBuildTask(options);

      runBuild();
    });

    it('sets release tag when passed', () => {
      expect(commandString).to.equal('cordova build ios --release');
    });
  });
});
