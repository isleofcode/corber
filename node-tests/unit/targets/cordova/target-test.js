const td             = require('testdouble');
const expect         = require('../../../helpers/expect');
const Promise        = require('rsvp').Promise;
const mockProject    = require('../../../fixtures/corber-mock/project');

const ValidatePlugin          = require('../../../../lib/targets/cordova/validators/plugin');
const ValidateAllowNavigation = require('../../../../lib/targets/cordova/validators/allow-navigation');

describe('Cordova Target', function() {
  let CordovaTarget;

  afterEach(function() {
    CordovaTarget = undefined;
    td.reset();
  });

  context('validatons', function() {
    let tasks = [];

    beforeEach(function() {
      CordovaTarget = require('../../../../lib/targets/cordova/target');

      tasks = [];

      td.replace(ValidatePlugin.prototype, 'run', function() {
        tasks.push('validate-plugin');
        return Promise.resolve();
      });

      td.replace(ValidateAllowNavigation.prototype, 'run', function() {
        tasks.push('validate-allow-navigation');
        return Promise.resolve();
      });
    });

    it('validate build runs the correct validators', function() {
      let target = new CordovaTarget();

      return target.validateBuild().then(function() {
        expect(tasks).to.deep.equal([
          'validate-allow-navigation'
        ]);
      });
    });

    it('validate serve runs the correct validators', function() {
      let target = new CordovaTarget();

      return target.validateServe().then(function() {
        expect(tasks).to.deep.equal([
          'validate-allow-navigation',
          'validate-plugin'
        ]);
      });
    });
  });

  context('getInstalledPlatforms', function() {
    it('returns platforms in cordova package.json', function() {
      let fsUtils = require('../../../../lib/utils/fs-utils');
      td.replace(fsUtils, 'existsSync', function() {
        return true;
      });

      td.replace('../../../../lib/utils/get-package', function() {
        return {
          cordova: {
            platforms: ['ios', 'android']
          }
        };
      });

      let CordovaTarget = require('../../../../lib/targets/cordova/target');
      let target = new CordovaTarget({
        project: mockProject.project
      });

      return target.getInstalledPlatforms().then((platforms) => {
        expect(platforms).to.deep.equal(['ios', 'android']);
      });
    });

    it('falls back to config.xml if package.json is missing', function() {
      let fsUtils = require('../../../../lib/utils/fs-utils');
      td.replace(fsUtils, 'existsSync', function () {
        return false;
      });

      td.replace('../../../../lib/utils/parse-xml', function() {
        return Promise.resolve({
          widget: {
            platform: [
              { $: { name: 'p' } },
              { $: { name: 'q' } },
            ]
          }
        });
      });

      let CordovaTarget = require('../../../../lib/targets/cordova/target');
      let target = new CordovaTarget({
        project: mockProject.project
      });

      return target.getInstalledPlatforms().then((platforms) => {
        expect(platforms).to.deep.equal(['p', 'q']);
      });
    });
  });

  context('build', function() {
    it('runs cordova build task', function() {
      let Build = td.replace('../../../../lib/targets/cordova/tasks/build');
      let CordovaTarget = require('../../../../lib/targets/cordova/target');
      let opts = {
        project: mockProject.project,
        platform: 'ios',
        cordovaOpts: {cordovaOpts: true}
      }

      let target = new CordovaTarget(opts);
      target.build(true);
      td.verify(new Build(opts));
    });
  });
});
