'use strict';

var RawTask         = require('../../../lib/tasks/cordova-raw');
var td              = require('testdouble');
var expect          = require('../../helpers/expect');
var cordovaPath     = require('../../../lib/utils/cordova-path');
var mockProject     = require('../../fixtures/ember-cordova-mock/project');
var Promise         = require('ember-cli/lib/ext/promise');
var cordovaLib      = require('cordova-lib');
var cordovaLogger   = require('cordova-common').CordovaLogger.get();

describe('Cordova Raw Task', function() {
  var rawTask;

  beforeEach(function() {
    rawTask = new RawTask({
      rawApi: 'platform',
      project: mockProject.project
    });
  });

  afterEach(function() {
    rawTask = null;
    RawTask.isSubscribedToLogs = false;
    td.reset();
  });

  describe('with a mock function', function() {
    var chdirDouble;

    beforeEach(function() {
      chdirDouble = td.replace(process, 'chdir');

      td.replace(RawTask.prototype, 'cordovaRawPromise', function() {
        return Promise.resolve();
      });
    });

    it('changes to cordova dir', function() {
      var cdvPath = cordovaPath(mockProject.project);

      return rawTask.run().then(function() {
        td.verify(chdirDouble(cdvPath));
      });
    });

    it('changes back to ember dir on compvarion', function() {
      var emberPath = process.cwd();

      return expect(
        rawTask.run().then(function() {
          var args = td.explain(chdirDouble).calls[1].args[0];
          return args
        })
      ).to.eventually.equal(emberPath);
    });

    describe('verbosity', function() {
      ['cordova', '*'].forEach(function(debugGroup) {
        context('when env DEBUG = ' + debugGroup, function() {
          var cachedDebug;

          before(function() {
            cachedDebug = process.env.DEBUG;
            process.env.DEBUG = debugGroup;
          });

          after(function() {
            process.env.DEBUG = cachedDebug;
          });

          beforeEach(function() {
            td.replace(cordovaLogger, 'setLevel');
            td.replace(cordovaLogger, 'subscribe');
          });

          context('and DEBUG_LEVEL !== trace', function() {
            it('sets up cdv logging', function() {
              return rawTask.run().then(function() {
                td.verify(cordovaLogger.subscribe(cordovaLib.events));
              });
            });
          });

          context('and DEBUG_LEVEL === trace', function() {
            var cachedDebugLevel;

            before(function() {
              cachedDebugLevel = process.env.DEBUG_LEVEL;
              process.env.DEBUG_LEVEL = 'trace';
            });

            after(function() {
              process.env.DEBUG_LEVEL = cachedDebugLevel;
            });

            it('sets up cdv logging', function() {
              return rawTask.run().then(function() {
                td.verify(cordovaLogger.subscribe(cordovaLib.events));
              });
            });

            it('logs verbosely', function() {
              return rawTask.run().then(function() {
                td.verify(cordovaLogger.setLevel('verbose'));
              });
            });
          });
        });
      });

      context('when env DEBUG = undefined', function() {
        it('does not log verbosely', function() {
          return rawTask.run().then(function() {
            td.verify(cordovaLogger.setLevel(), {
              times: 0,
              ignoreExtraArgs: true
            });
          });
        });
      });
    });
  });

  describe('when the raw task fails', function() {
    var cachedDebug;

    before(function() {
      cachedDebug = process.env.DEBUG;
      process.env.DEBUG = undefined;
    });

    after(function() {
      process.env.DEBUG = cachedDebug;
    });

    beforeEach(function() {
      td.replace(RawTask.prototype, 'cordovaRawPromise', function() {
        return Promise.reject(new Error('fail'));
      });
    });

    it('rejects run() with the failure', function() {
      return expect(rawTask.run()).to.be.rejectedWith(
        /fail/
      );
    });
  });
});
