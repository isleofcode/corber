'use strict';

var td              = require('testdouble');
var expect          = require('../../helpers/expect');
var Promise         = require('rsvp');

var CdvBuildTask    = require('../../../lib/targets/cordova/tasks/build');
var BashTask        = require('../../../lib/tasks/bash');
var HookTask        = require('../../../lib/tasks/run-hook');
var LRloadShellTask = require('../../../lib/tasks/create-livereload-shell');

var mockProject     = require('../../fixtures/corber-mock/project');
var mockAnalytics   = require('../../fixtures/corber-mock/analytics');

var ValidatePlugin          = require('../../../lib/targets/cordova/validators/plugin');
var ValidateAllowNavigation = require('../../../lib/targets/cordova/validators/allow-navigation');

describe('Serve Command', function() {
  var serveCmd;
  var tasks = [];

  afterEach(function() {
    td.reset();
  });

  beforeEach(function() {
    mockTasks();

    var ServeCmd = require('../../../lib/commands/serve');
    td.replace(ServeCmd, '_serveHang', function() {
      return Promise.resolve();
    });

    serveCmd = new ServeCmd({
      project: mockProject.project
    });

    serveCmd.analytics = mockAnalytics;
    serveCmd.project.config = function() {
      return {
        locationType: 'hash',

      };
    };
  });

  function mockTasks() {
    tasks = [];

    td.replace('../../../lib/utils/require-framework', function() {
      return {
        validateServe: function() {
          tasks.push('framework-validate-serve');
          return Promise.resolve();
        },

        serve: function() {
          tasks.push('framework-serve');
          return Promise.resolve();
        }
      };
    });

    td.replace('../../../lib/targets/cordova/utils/edit-xml', {
      addNavigation: function() {
        tasks.push('add-navigation');
        return Promise.resolve();
      },

      removeNavigation: function() {
        tasks.push('remove-navigation');
        return Promise.resolve();
      }
    });

    td.replace(HookTask.prototype, 'run', function(hookName, options) {
      expect(options, `${hookName} options`).to.be.an('object');
      tasks.push('hook ' + hookName);
      return Promise.resolve();
    });

    td.replace(ValidatePlugin.prototype, 'run', function() {
      tasks.push('validate-plugin');
      return Promise.resolve();
    });

    td.replace(ValidateAllowNavigation.prototype, 'run', function() {
      tasks.push('validate-allow-navigation');
      return Promise.resolve();
    });


    td.replace(LRloadShellTask.prototype, 'run', function() {
      tasks.push('create-livereload-shell');
      return Promise.resolve();
    });

    td.replace(CdvBuildTask.prototype, 'run', function() {
      tasks.push('cordova-build');
      return Promise.resolve();
    });

    td.replace(BashTask.prototype, 'run', function() {
      tasks.push('serve-bash');
      return Promise.resolve();
    });
  }

  it('exits cleanly', function() {
    return expect(function() {
      serveCmd.run({});
    }).not.to.throw(Error);
  });

  it('sets vars for webpack livereload', function() {
    return serveCmd.run({platform: 'ios'}).then(function() {
      let project = mockProject.project;
      expect(project.CORBER_PLATFORM).to.equal('ios');
    });
  });

  it('sets process.env.CORBER_PLATFORM & CORBER_LIVERELOAD', function() {
    return serveCmd.run({platform: 'ios'}).then(function() {
      expect(process.env.CORBER_PLATFORM).to.equal('ios');
      expect(process.env.CORBER_LIVERELOAD).to.equal('true');
    });
  });

  it('runs tasks in the correct order', function() {
    return serveCmd.run({}).then(function() {
      expect(tasks).to.deep.equal([
        'add-navigation',
        'hook beforeBuild',
        'validate-allow-navigation',
        'validate-plugin',
        'framework-validate-serve',
        'create-livereload-shell',
        'cordova-build',
        'hook afterBuild',
        'framework-serve',
        'remove-navigation'
      ]);
    });
  });

  it('skips emer & cordova builds with --skip flags', function() {
    return serveCmd.run({
      skipFrameworkBuild: true,
      skipCordovaBuild: true
    }).then(function() {
      expect(tasks).to.deep.equal([
        'add-navigation',
        'hook beforeBuild',
        'validate-allow-navigation',
        'validate-plugin',
        'framework-validate-serve',
        'create-livereload-shell',
        'hook afterBuild',
        'remove-navigation'
      ]);
    });
  });
});
