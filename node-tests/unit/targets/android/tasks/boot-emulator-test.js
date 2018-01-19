const td              = require('testdouble');
const expect          = require('../../../../helpers/expect');
const emList          = 'emulator-5554          device product:sdk_gphone_x86 model:Android_SDK_built_for_x86 device:generic_x86 transport_id:26';

const path            = require('path');
const sdkPath         = path.join(process.env['HOME'], 'Library/Android/sdk');
const emulatorPath    = path.join(sdkPath, 'tools', 'emulator');

describe('Android Boot Emulator', function() {
  afterEach(function() {
    td.reset();
  });

  it('spawns emulator -avd', function() {
    let spawnProps = {};

    td.replace('../../../../../lib/utils/spawn', function(cmd, args) {
      spawnProps.cmd = cmd;
      spawnProps.args = args;
      return Promise.resolve();
    });

    td.replace('../../../../../lib/targets/android/tasks/list-running-emulators', function() {
      return Promise.resolve(emList);
    });

    let bootEm = require('../../../../../lib/targets/android/tasks/boot-emulator');

    return bootEm({name: 'fake-emulator'}).then(function() {
      expect(spawnProps.cmd).to.equal(emulatorPath);
      expect(spawnProps.args).to.deep.equal(['-avd', 'fake-emulator']);
    });
  });

  it('polls until the android emulator has booted', function() {
    td.replace('../../../../../lib/utils/spawn', function() {
      return Promise.resolve();
    });

    let called = false;
    td.replace('../../../../../lib/targets/android/tasks/list-running-emulators', function() {
      called = true;
      return Promise.resolve(emList);
    });

    let bootEm = require('../../../../../lib/targets/android/tasks/boot-emulator');
    bootEm({name: 'fake-emulator'}).then(function(bootedEm) {
      expect(called).to.equal(true);
      expect(bootedEm).to.equal('foo');
    });
  });
});