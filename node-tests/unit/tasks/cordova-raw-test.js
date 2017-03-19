'use strict';

var RawTask         = require('../../../lib/tasks/cordova-raw');
var td              = require('testdouble');
var expect          = require('../../helpers/expect');
var cordovaPath     = require('../../../lib/utils/cordova-path');
var mockProject     = require('../../fixtures/ember-cordova-mock/project');
var Promise         = require('ember-cli/lib/ext/promise');
var cordovaLib      = require('cordova-lib');
var cordovaProj     = cordovaLib.cordova;
var events          = cordovaLib.events;
var cordovaLogger   = require('cordova-common').CordovaLogger.get();

describe('Cordova Raw Task', function() {
  var setupTask = function() {
    return new RawTask({
      rawApi: 'platform',
      project: mockProject.project
    });
  };

  afterEach(function() {
    td.reset();
  });

  it('sets up cdv logging and attempts a raw cordova call', function(done) {
    // n.b. need these together & at the top of file due to de-duplication of
    // `cordovaLogger.subscribe` calls on require
    td.replace(cordovaLogger, 'subscribe');
    td.replace(cordovaProj.raw, 'platform', function() {
      done();
    });

    var raw = setupTask();

    return raw.run().then(function() {
      td.verify(cordovaLogger.subscribe(events));
    });
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
      var raw = setupTask();

      return raw.run().then(function() {
        td.verify(chdirDouble(cdvPath));
      });
    });

    it('changes back to ember dir on compvarion', function() {
      var emberPath = process.cwd();
      var raw = setupTask();

      return expect(
        raw.run().then(function() {
          var args = td.explain(chdirDouble).calls[1].args[0];
          return args
        })
      ).to.eventually.equal(emberPath);
    });

    describe('verbosity', function() {
      var raw;
      var setDebug = function setDebug(term) {
        var cachedDebug = process.env.DEBUG;

        before(function() {
          process.env.DEBUG = term;
        });

        after(function() {
          process.env.DEBUG = cachedDebug;
        });
      }

      beforeEach(function() {
        td.replace(cordovaLogger, 'setLevel');
        raw = setupTask();
      });

      context('when env DEBUG = cordova', function() {
        setDebug('cordova');

        it('logs verbosely', function() {
          return raw.run().then(function() {
            td.verify(cordovaLogger.setLevel('verbose'));
          });
        });
      });

      context('when env DEBUG = *', function() {
        setDebug('*');

        it('logs verbosely', function() {
          return raw.run().then(function() {
            td.verify(cordovaLogger.setLevel('verbose'));
          });
        });
      });

      context('when env DEBUG = undefined', function() {
        setDebug(undefined);

        it('does not log verbosely', function() {
          return raw.run().then(function() {
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
    beforeEach(function() {
      td.replace(RawTask.prototype, 'cordovaRawPromise', function() {
        return Promise.reject(new Error('fail'));
      });
    });

    it('rejects run() with the failure', function() {
      var raw = setupTask();

      return expect(raw.run()).to.be.rejectedWith(
        /fail/
      );
    });
  });
});
