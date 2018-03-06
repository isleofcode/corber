const td              = require('testdouble');
const expect          = require('../../helpers/expect');
const Promise         = require('rsvp');
const LRloadShell     = require('../../../lib/tasks/create-livereload-shell');
const CdvTarget       = require('../../../lib/targets/cordova/target');
const CdvRaw          = require('../../../lib/targets/cordova/tasks/raw');
const IOSTarget       = require('../../../lib/targets/ios/target');
const Hook            = require('../../../lib/tasks/run-hook');
const mockProject     = require('../../fixtures/corber-mock/project');
const mockAnalytics   = require('../../fixtures/corber-mock/analytics');

const iosEmulators = [{
  id: 1,
  name: 'iOS Em 1',
  label() {
    return 'iOS Em 1 Label';
  },
  state: 'Booted',
  platform: 'ios',
  deviceType: 'device'
}, {
  id: 2,
  name: 'iOS Em 2',
  label() {
    return 'iOS Em 2 Label';
  },
  state: 'Shutdown',
  platform: 'ios',
  deviceType: 'device'
}];

const androidEmulators = [{
  id: 1,
  name: 'Android Em 1',
  label() {
    return 'Android Em 1 Label';
  },
  platform: 'android',
  deviceType: 'emulator'
}];

const androidDevices = [{
  id: 1,
  name: 'Android Device 1',
  label() {
    return 'Android Device 1 Label';
  },
  platform: 'android',
  deviceType: 'device'
}];

const setupStart = function() {
  let StartCmd = require('../../../lib/commands/start');
  let start = new StartCmd({
    project: mockProject.project
  });

  start.analytics = mockAnalytics;
  start.project.config = function() {
    return {
      locationType: 'hash',

    };
  };

  return start;
};

describe('Start Command', function() {
  afterEach(function() {
    td.reset();
  });

  context('run', function() {
    let start, tasks;
    beforeEach(function() {
      tasks = [];

      td.replace('../../../lib/targets/cordova/utils/edit-xml', {
        addNavigation: function() {
          tasks.push('add-navigation');
          return Promise.resolve();
        }
      });

      td.replace('../../../lib/utils/require-framework', function() {
        return {
          validateServe() {
            tasks.push('framework-validate-serve');
            return Promise.resolve();
          },

          serve() {
            tasks.push('framework-serve');
            return Promise.resolve();
          }
        };
      });

      td.replace(IOSTarget.prototype, 'build', function() {
        tasks.push('platform-target-build');
        return Promise.resolve();
      });

      td.replace(IOSTarget.prototype, 'run', function() {
        tasks.push('platform-target-run');
        return Promise.resolve();
      });

      td.replace(Hook.prototype, 'run', function(hookName, options) {
        tasks.push(`hook-${hookName}`);
        return Promise.resolve();
      });

      td.replace(CdvTarget.prototype, 'validateServe', function() {
        tasks.push('cordova-validate-serve');
        return Promise.resolve();
      });

      td.replace(CdvTarget.prototype, 'getInstalledPlatforms', function() {
        return Promise.resolve(['ios']);
      });

      td.replace(LRloadShell.prototype, 'run', function() {
        tasks.push('create-livereload-shell');
        return Promise.resolve();
      });

      td.replace(CdvRaw.prototype, 'run', function() {
        tasks.push('cordova-prepare');
        return Promise.resolve();
      });

      start = setupStart();

      td.replace(start, 'selectDevice', function() {
        tasks.push('select-emulator');
        return Promise.resolve({name: 'emulator', platform: 'ios'});
      });
    });

    it('run runs tasks in the correct order', function() {
      return start.run({}).then(function() {
        expect(tasks).to.deep.equal([
          'select-emulator',
          'hook-beforeBuild',
          'add-navigation',
          'cordova-validate-serve',
          'framework-validate-serve',
          'create-livereload-shell',
          'cordova-prepare',
          'platform-target-build',
          'hook-afterBuild',
          'platform-target-run',
          'framework-serve'
        ]);
      });
    });

    it('skips platformTarget build with --scb', function() {
      return start.run({skipCordovaBuild: true}).then(function() {
        expect(tasks).to.deep.equal([
          'select-emulator',
          'hook-beforeBuild',
          'add-navigation',
          'cordova-validate-serve',
          'framework-validate-serve',
          'create-livereload-shell',
          'cordova-prepare',
          'hook-afterBuild',
          'platform-target-run',
          'framework-serve'
        ]);
      });
    });

    it('skips framework serve with --sfb', function() {
      return start.run({skipFrameworkBuild: true}).then(function() {
        expect(tasks).to.deep.equal([
          'select-emulator',
          'hook-beforeBuild',
          'add-navigation',
          'cordova-validate-serve',
          'framework-validate-serve',
          'create-livereload-shell',
          'cordova-prepare',
          'platform-target-build',
          'hook-afterBuild',
          'platform-target-run'
        ]);
      });
    });

    it('sets vars for webpack livereload', function() {
      return start.run({build: false, platform: 'ios'}).then(function() {
        expect(mockProject.project.targetIsCordova).to.equal(true);
        expect(mockProject.project.CORBER_PLATFORM).to.equal('ios')
        expect(mockProject.project.targetIsCordovaLivereload).to.equal(true);
      });
    });
  });

  describe('getReloadURL', function() {
    it('defaults to reloadUrl when provided', function() {
      let start = setupStart();
      let reloadUrl = start.getReloadUrl(1000, 'reloadUrl');
      expect(reloadUrl).to.equal('reloadUrl');
    });

    it('generates with options.port and networkAddress', function() {
      td.replace('../../../lib/utils/get-network-ip', function() {
        return 'networkAddress';
      });

      let start = setupStart();

      let reloadUrl = start.getReloadUrl(1000);
      expect(reloadUrl).to.equal('http://networkAddress:1000');
    });

    it('generates with framework.port when options is not passed', function() {
      td.replace('../../../lib/utils/get-network-ip', function() {
        return 'networkAddress';
      });

      let start = setupStart();

      let reloadUrl = start.getReloadUrl(undefined, undefined, { port: 'frameworkPort' });
      expect(reloadUrl).to.equal('http://networkAddress:frameworkPort');
    });
  });

  describe('selectDevice', function() {
    beforeEach(function() {
      td.replace('../../../lib/targets/ios/tasks/list-emulators', function() {
        return Promise.resolve(iosEmulators);
      });

      td.replace('../../../lib/targets/android/tasks/list-emulators', function() {
        return Promise.resolve(androidEmulators);
      });

      td.replace('../../../lib/targets/android/tasks/list-devices', function() {
        return Promise.resolve(androidDevices);
      });
    });

    it('prompts for an emulator if one is not passed', function() {
      let start = setupStart();

      let promptArgs;
      start.ui = {
        prompt: function(opts) {
          promptArgs = opts;
          return Promise.resolve({emulator: iosEmulators[0]});
        }
      }

      return start.selectDevice({emulator: '', platform: 'ios'}, ['ios']).then(function() {
        expect(promptArgs.message).to.equal('Select a device/emulator');
        expect(promptArgs.type).to.equal('list');
        expect(promptArgs.choices[0].value).to.deep.equal(iosEmulators[0]);
        expect(promptArgs.choices[1].value).to.deep.equal(iosEmulators[1]);
      });
    });

    it('finds emulator by name', function() {
      let start = setupStart();

      return start.selectDevice({emulator: 'iOS Em 1'}, ['ios']).then(function(selected) {
        expect(selected).to.deep.equal(iosEmulators[0]);
      });
    });

    it('only shows emulators for the selected platform', function() {
      let start = setupStart();

      let promptArgs;
      start.ui = {
        prompt: function(opts) {
          promptArgs = opts;
          return Promise.resolve({emulator: iosEmulators[0]});
        }
      }

      return start.selectDevice({emulator: '', platform: 'android'}, ['android']).then(function() {
        expect(promptArgs.choices.length).to.equal(2);
      });
    });

    it('defaults to including emulators from both platforms', function() {
      let start = setupStart();

      let promptArgs;
      start.ui = {
        prompt: function(opts) {
          promptArgs = opts;
          return Promise.resolve({emulator: iosEmulators[0]});
        }
      }

      return start.selectDevice({emulator: ''}, ['ios', 'android']).then(function() {
        expect(promptArgs.choices.length).to.equal(4);
      });
    });
  });

  describe('validatePlatform', function() {
    afterEach(function() {
      td.reset();
    });

    it('throws an error when builds are for a platform that is not installed', function() {
      let start = setupStart();
      let fn = () => {
        start.validatePlatform(['ios'], 'android');
      };

      expect(fn).to.throw();
    });

    it('passes when builds are for an installed platform', function() {
      let logger = td.replace('../../../lib/utils/logger');

      let start = setupStart();
      start.validatePlatform(['ios'], 'ios');

      td.verify(logger.error(), { times: 0 });
    });
  });
});
