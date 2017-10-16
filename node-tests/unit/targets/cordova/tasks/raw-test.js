var RawTask         = require('../../../../../lib/targets/cordova/tasks/raw');
var td              = require('testdouble');
var expect          = require('../../../../helpers/expect');
var cordovaPath     = require('../../../../../lib/targets/cordova/utils/get-path');
var mockProject     = require('../../../../fixtures/corber-mock/project');
var Promise         = require('rsvp');
var cordovaLib      = require('cordova-lib');
var cordovaProj     = cordovaLib.cordova;
var events          = cordovaLib.events;
var cordovaLogger   = require('cordova-common').CordovaLogger.get();

describe('Cordova Raw Task', function() {
  var setupTask = function() {
    return new RawTask({
      api: 'platform',
      project: mockProject.project
    });
  };

  afterEach(function() {
    td.reset();
  });

  it('attempts to run a raw cordova call', function(done) {
    td.replace(cordovaProj, 'platform', function() {
      done();
    });

    var raw = setupTask();
    return raw.run();
  });

  describe('with a mock function', function() {
    var chdirDouble;

    beforeEach(function() {
      chdirDouble = td.replace(process, 'chdir');

      td.replace(RawTask.prototype, 'cordovaPromise', function() {
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

    it('inits a callback which resolves', function() {
      var cdvPath = cordovaPath(mockProject.project);
      var raw = setupTask();

        return expect(raw.run()).to.eventually.be.fulfilled;
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

    it('sets up Cordova logging', function() {
      td.replace(cordovaLogger, 'subscribe');
      var raw = setupTask();

      return raw.run().then(function() {
        td.verify(cordovaLogger.subscribe(events));
      });
    });

    it('logs verbosely when requested', function() {
      td.replace(cordovaLogger, 'setLevel');
      var raw = setupTask();

      return raw.run({ verbose: true }).then(function() {
        td.verify(cordovaLogger.setLevel('verbose'));
      });
    });
  });

  describe('when the raw task fails', function() {
    beforeEach(function() {
      td.replace(RawTask.prototype, 'cordovaPromise', function() {
        return Promise.reject(new Error('fail'));
      });
    });

    it('rejects run() with the failure', function() {
      var raw = setupTask();

      return expect(raw.run()).to.eventually.be.rejectedWith(
        /fail/
      );
    });
  });
});
