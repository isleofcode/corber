'use strict';

const td            = require('testdouble');
const expect        = require('../../helpers/expect');
const PromiseExt    = require('ember-cli/lib/ext/promise');

const mockProject   = require('../../fixtures/ember-cordova-mock/project');

describe('Build Command', () => {
  let tasks, BuildCmd, buildEnv, cordovaPlatform, isRelease;

  beforeEach(() => {
    tasks = mockTasks();
  });

  afterEach(() => {
    td.reset();
  });

  function runBuild(_options) {
    let options = _options || {};
    BuildCmd.run(options);
  }

  function mockBuildCommand(configOptions) {
    BuildCmd = require('../../../lib/commands/build');

    BuildCmd.project = mockProject.project;
    BuildCmd.ui = mockProject.ui;

    BuildCmd.project.config = function() {
      return configOptions || {};
    };

    return BuildCmd;
  }

  context('when locationType is hash', () => {
    beforeEach(() => {
      let config = { locationType: 'hash' };
      mockBuildCommand(config);
    });

    it('exits cleanly', () => {
      expect(runBuild).not.to.throw(Error);
    });

    it('runs tasks in the correct order', () => {
      runBuild();

      //h-t ember-electron for the pattern
      expect(tasks).to.deep.equal([
        'hook beforeBuild',
        'ember-build',
        'link',
        'cordova-build',
        'hook afterBuild'
      ]);
    });

    context('when env option is passed', () => {
      let passedEnv = 'development';

      beforeEach(() => {
        let options = { environment: passedEnv }
        runBuild(options);
      });

      it('passes the env to the ember build task', () => {
        expect(buildEnv).to.equal(passedEnv);
      });
    });

    context('when platform option is passed', () => {
      let passedPlatform = 'ios';

      beforeEach(() => {
        let options = { platform: passedPlatform };
        runBuild(options);
      });

      it('passes platform to cordova build task', () => {
        expect(cordovaPlatform).to.equal(passedPlatform);
      });
    });

    context('when release option is passed', () => {
      context('as false', () => {
        beforeEach(() => {
          let options = { release: false };
          runBuild(options);
        });

        it('does not build a cordova release', () => {
          expect(isRelease).to.equal(false);
        });
      });

      context('as undefined', () => {
        beforeEach(() => {
          let options = { release: undefined };
          runBuild(options);
        });

        it('does not build a cordova release', () => {
          expect(isRelease).to.equal(false);
        });
      });

      context('as true', () => {
        beforeEach(() => {
          let options = { release: true };
          runBuild(options);
        });

        it('builds a cordova release', () => {
          expect(isRelease).to.equal(true);
        });
      });

      context('as null', () => {
        beforeEach(() => {
          let options = { release: null };
          runBuild(options);
        });

        it('builds a cordova release', () => {
          expect(isRelease).to.equal(true);
        });
      });

      context('as not undefined', () => {
        beforeEach(() => {
          let options = { release: '' };
          runBuild(options);
        });

        it('builds a cordova release', () => {
          expect(isRelease).to.equal(true);
        });
      });
    });
  });

  context('when locationType is not hash', () => {
    beforeEach(() => {
      BuildCmd.project.config = function() {
        let config = { locationType: 'auto' };
        return config;
      };
    });

    it('throws', () => {
      expect(runBuild).to.throw(Error);
    });
  });

  function mockTasks() {
    let tasks = [];

    td.replace('../../../lib/tasks/run-hook', function() {
      this.run = function(hookName) {
        tasks.push('hook ' + hookName);
        return PromiseExt.resolve();
      };
    });

    td.replace('../../../lib/tasks/ember-build', function() {
      this.run = function(_buildEnv) {
        buildEnv = _buildEnv;

        tasks.push('ember-build');
        return PromiseExt.resolve();
      };
    });

    td.replace('../../../lib/tasks/cordova-build', function(opts) {
      if (opts !== undefined) {
        isRelease = opts.isRelease;
        cordovaPlatform = opts.platform;
      }

      this.run = function() {
        tasks.push('cordova-build');
        return PromiseExt.resolve();
      };
    });

    td.replace('../../../lib/tasks/link-environment', function() {
      this.run = function() {
        tasks.push('link');
        return PromiseExt.resolve();
      };
    });

    return tasks;
  }
});
