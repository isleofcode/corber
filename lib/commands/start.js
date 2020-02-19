const Command              = require('./-command');
const runHook              = require('../tasks/run-hook');
const CreateLRShell        = require('../tasks/create-livereload-shell');
const CordovaTarget        = require('../targets/cordova/target');
const CordovaRaw           = require('../targets/cordova/tasks/raw');
const editXml              = require('../targets/cordova/utils/edit-xml');
const getPlatforms         = require('../targets/cordova/utils/get-platforms');
const listAndroidEmulators = require('../targets/android/tasks/list-emulators');
const listAndroidDevices   = require('../targets/android/tasks/list-devices');
const AndroidTarget        = require('../targets/android/target');
const listIOSEmulators     = require('../targets/ios/tasks/list-emulators');
const listIOSDevices       = require('../targets/ios/tasks/list-devices');
const IOSTarget            = require('../targets/ios/target');
const getNetworkIp         = require('../utils/get-network-ip');
const logger               = require('../utils/logger');
const requireFramework     = require('../utils/require-framework');
const RSVP                 = require('rsvp');

const supportedPlatforms   = ['ios', 'android'];

module.exports = Command.extend({
  name: 'start',
  aliases: [ 'start' ],
  description: 'Run app on device/emulator with livereload',

  /* eslint-disable max-len */
  availableOptions: [
    { name: 'platform',             type: String },
    { name: 'emulator',             type: String },
    { name: 'emulator-id',          type: String },
    { name: 'build',                type: Boolean },
    { name: 'browserify',           type: Boolean, default: false },
    { name: 'reload-url',           type: String,  aliases: ['r'] },
    { name: 'live-reload',          type: Boolean, default: true,  aliases: ['lr'] },
    { name: 'port',                 type: Number,  aliases: ['p'] },
    { name: 'force',                type: Boolean, default: false },
    { name: 'skip-framework-build', type: Boolean, default: false, aliases: ['sfb'] },
    { name: 'skip-cordova-build',   type: Boolean, default: false, aliases: ['scb'] }
  ],
  /* eslint-enable max-len */


  buildReloadUrl(port, reloadUrl, framework = {}) {
    if (reloadUrl) { return reloadUrl; }

    if (port === undefined) {
      port = framework.port;
    }

    let networkAddress = getNetworkIp();
    let url = `http://${networkAddress}`;

    if (port) {
      url = `${url}:${port}`;
    }

    return url;
  },

  selectPlatforms(opts = {}) {
    return getPlatforms(this.project).then((platforms) => {
      if (opts.platform) {
        if (!supportedPlatforms.includes(opts.platform)) {
          throw new Error(`'${opts.platform}' is not a supported platform`);
        }

        if (!platforms.includes(opts.platform)) {
          /* eslint-disable max-len */
          throw new Error(
            `You are passing platform=${opts.platform} which is not installed.\n` +
            `Try running corber platform add ${opts.platform}`
          );
          /* eslint-enable max-len */
        }

        return [opts.platform];
      }

      if (platforms.length === 0) {
        throw new Error('No platforms installed. Install a platform using\n\n' +
          '\tcorber platform add <ios|android>\n\n' +
          'before running "corber start".\n');
      }

      return platforms;
    });
  },

  selectDevice(platforms, opts = {}) {
    return this.getInstalledDevices(platforms).then((devices) => {
      if (opts.emulator) {
        let device = devices.find((d) => d.name === opts.emulator);

        if (!device) {
          throw new Error(`no device with name=${opts.emulator}`);
        }

        return device;
      }

      if (opts.emulatorId) {
        let device = devices.find((d) => d.id === opts.emulatorId);

        if (!device) {
          throw new Error(`no device with id=${opts.emulatorId}`);
        }

        return device;
      }

      if (devices.length === 0) {
        /* eslint-disable max-len */
        let message = 'No emulators or devices found. You must connect a device or install an iOS or Android emulator before running "corber start".';

        if (platforms.includes('ios')) {
          message += '\n\nTo run on an iOS emulator, you may first need to run:\n\n'
           + '\tsudo xcode-select -s /Applications/Xcode.app/Contents/Developer\n\n'
           + 'more: http://corber.io/pages/ios-setup';
        }
        /* eslint-enable max-len */

        throw new Error(message);
      }

      return this.promptForDevice(devices);
    });
  },

  getInstalledDevices(platforms) {
    let promises = [];

    if (platforms.includes('ios')) {
      promises.push(listIOSDevices());
      promises.push(listIOSEmulators());
    }

    if (platforms.includes('android')) {
      promises.push(listAndroidDevices());
      promises.push(listAndroidEmulators());
    }

    return RSVP.allSettled(promises).then((results) => {
      return results.filter((r) => r.state === 'fulfilled')
        .reduce((arr, result) => arr.concat(result.value), []);
    });
  },

  promptForDevice(devices) {
    let choices = devices.map((device, i) => {
      return {
        key: i,
        name: device.label(),
        value: device
      };
    });

    let promptOpts = {
      type: 'list',
      name: 'device',
      message: 'Select a device/emulator',
      pageSize: 30,
      choices
    };

    return this.ui.prompt(promptOpts).then((selected) => {
      return selected.device;
    });
  },

  getTargetForPlatform(platform) {
    switch (platform) {
      case 'ios':
        return IOSTarget;
      case 'android':
        return AndroidTarget;
      default:
        throw new Error(`invalid platform '${platform}'`);
    }
  },

  run(opts = {}) {
    this._super(...arguments);

    let project = this.project;
    let framework = requireFramework(project);
    let reloadUrl = this.buildReloadUrl(opts.port, opts.reloadUrl, framework);

    let cdvTarget = new CordovaTarget({
      project: project,
      browserify: opts.browserify
    });

    let createLRShell = new CreateLRShell({
      project: project
    });

    let prepare = new CordovaRaw({
      project: project,
      api: 'prepare'
    });

    let hookOptions = { root: this.project.root };

    logger.info('Corber Starting');

    let device;
    let platformTarget;

    return this.selectPlatforms(opts)
      .then((platforms) => this.selectDevice(platforms, opts))
      .then((_device) => {
        device = _device;

        // supports webpack addon
        cdvTarget.platform = device.platform;
        opts.platform = device.platform;

        process.env.CORBER_PLATFORM = device.platform;
        process.env.CORBER_LIVERELOAD = true;

        let PlatformTarget = this.getTargetForPlatform(device.platform);

        platformTarget = new PlatformTarget({
          device,
          project
        });

        return runHook('beforeBuild', opts, hookOptions);
      })
      .then(() => editXml.addNavigation(project, reloadUrl))
      .then(() => {
        if (cdvTarget.platform === 'android') {
          return editXml.addAndroidCleartext(this.project);
        }
      })
      .then(() => cdvTarget.validateServe())
      .then(() => framework.validateServe(opts))
      .then(() => createLRShell.run(reloadUrl))
      .then(() => prepare.run({ platforms: [device.platform] }))
      .then(() => platformTarget.build())
      .then(() => runHook('afterBuild', opts, hookOptions))
      .then(() => platformTarget.run())
      .then(() => framework.serve(opts))
      .then(() => editXml.removeNavigation(project, reloadUrl))
      .then(() => {
        if (cdvTarget.platform === 'android') {
          return editXml.removeAndroidCleartext(this.project);
        }
      })
      .catch((e) => {
        logger.error(e);
        logger.error(e.stack);
        throw e;
      });
  }
});
