const td              = require('testdouble');
const expect          = require('../../../../helpers/expect');
const Promise         = require('rsvp').Promise;
const Device          = require('../../../../../lib/objects/device');

const emList          = 'Nexus_5X_API_27\nPixel_2_API_27';

describe('Android List Emulators', function() {
  beforeEach(function() {
    td.replace('../../../../../lib/targets/android/utils/sdk-paths', function() {
      return {
        emulator: 'emulatorPath'
      }
    });
  });

  afterEach(function() {
    td.reset();
  });

  it('spawns emulator', function() {
    let spawnProps = {};

    td.replace('../../../../../lib/utils/spawn', function(cmd, args) {
      spawnProps.cmd = cmd;
      spawnProps.args = args;
      return Promise.resolve(emList);
    });

    let listEms = require('../../../../../lib/targets/android/tasks/list-emulators');

    return listEms().then(function() {
      expect(spawnProps.cmd).to.equal('emulatorPath');
      expect(spawnProps.args).to.deep.equal(['-list-avds']);
    });
  });

  it('parses emulator -list-avds to Emulator objects', function() {
    td.replace('../../../../../lib/utils/spawn', function(cmd, args) {
      return Promise.resolve(emList);
    });

    let listEms = require('../../../../../lib/targets/android/tasks/list-emulators');

    return listEms().then(function(found) {
      expect(found).to.deep.equal([
        new Device({
          name: 'Pixel_2_API_27',
          platform: 'android',
          deviceType: 'emulator'
        }),
        new Device({
          name: 'Nexus_5X_API_27',
          platform: 'android',
          deviceType: 'emulator'
        })]);
    });
  });
});
