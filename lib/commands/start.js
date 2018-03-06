const Command          = require('./-command');
const Hook             = require('../tasks/run-hook');
const logger           = require('../utils/logger');
const CordovaTarget    = require('../targets/cordova/target');
const CordovaRaw       = require('../targets/cordova/tasks/raw');
const editXml          = require('../targets/cordova/utils/edit-xml');
const getNetworkIp     = require('../utils/get-network-ip');
const requireFramework = require('../utils/require-framework');
const RSVP             = require('rsvp');
const Promise          = RSVP.Promise;

const listAndroidEms   = require('../targets/android/tasks/list-emulators');
const listAndroidDevices = require('../targets/android/tasks/list-devices');
const AndroidTarget    = require('../targets/android/target');
const listIOSEms       = require('../targets/ios/tasks/list-emulators');
const IOSTarget        = require('../targets/ios/target');

const CreateLiveReloadShell = require('../tasks/create-livereload-shell');

module.exports = Command.extend({
  name: 'start',
  aliases: [ 'start' ],
  description: 'Run app on device/emulator /w livereload',
  works: 'insideProject',

  /* eslint-disable max-len */
  availableOptions: [
    { name: 'platform',   type: String },
    { name: 'emulator',   type: String,  default: '' },
    { name: 'emulatorid', type: String },
    { name: 'build',      type: Boolean },
    { name: 'reload-url', type: String,  aliases: ['r'] },
    { name: 'port',       type: Number,  aliases: ['p'] },
    { name: 'skip-framework-build', type: Boolean, default: false, aliases: ['sfb'] },
    { name: 'skip-cordova-build',   type: Boolean, default: false, aliases: ['scb'] }
  ],
  /* eslint-enable max-len */

  getReloadUrl(port, reloadUrl, framework) {
    if (reloadUrl) { return reloadUrl; }

    if (port === undefined) {
      port = framework.port;
    }

    let networkAddress = getNetworkIp();
    return 'http://' + networkAddress + ':' + port;
  },

  selectDevice(opts, installedPlatforms) {
    let foundDevices = [];
    if (opts.platform !== 'ios' && installedPlatforms.includes('android')) {
      foundDevices.push(listAndroidEms());
      foundDevices.push(listAndroidDevices());
    }

    if (opts.platform !== 'android' && installedPlatforms.includes('ios')) {
      foundDevices.push(listIOSEms());
    }

    return RSVP.allSettled(foundDevices).then((results) => {
      let devices = results.reduce((arr, result) => {
        if (result.state === 'fulfilled') {
          return arr.concat(result.value);
        }
        return arr;
      }, []);

      if (devices.length === 0) {
        logger.error('No emulators found. You must install an iOS or Android '
          + 'emulator before running "corber start".');
        return Promise.reject();
      }

      if (opts.emulator === '') {
        let promptOpts = {
          type: 'list',
          name: 'device',
          message: 'Select a device/emulator',
          pageSize: 30,
          choices: []
        };

        devices.forEach((em, i) => {
          promptOpts.choices.push({
            key: i,
            name: em.label(),
            value: em
          });
        });

        return this.ui.prompt(promptOpts).then((selected) => {
          return selected.device;
        });
      } else {
        //Preference --emulator vs emulatorID if passed
        let device;
        if (opts.emulator) {
          device = devices.find(function(d) {
            if (d.name === opts.emulator) { return d; }
          });
        }

        return Promise.resolve(device);
      }
    });
  },

  validatePlatform(installedPlatforms, targetPlatform) {
    //If no target platfor mshow all installed platforms
    if (targetPlatform && !installedPlatforms.includes(targetPlatform)) {
      logger.error(`
        You are passing platform=${targetPlatform} which is not installed.
        Try running corber platform add ${targetPlatform}`);
    }
  },

  run(opts) {
    this._super.apply(this, arguments);
    logger.info('Corber Starting');

    let cdvTarget = new CordovaTarget({
      project: this.project
    });

    return cdvTarget.getInstalledPlatforms().then((platforms) => {
      if (platforms.length === 0) {
        logger.error('No platforms installed.');
        return Promise.reject();
      }

      this.validatePlatform(platforms, opts.platform);
      return this.selectDevice(opts, platforms);
    }).then((device) => {
      //supports webpack addon
      this.project.targetIsCordova = true;
      this.project.CORBER_PLATFORM = device.platform;
      this.project.targetIsCordovaLivereload = true;

      cdvTarget.platform = device.platform;

      let platformTarget;
      if (device.platform === 'ios') {
        platformTarget = new IOSTarget({
          device: device,
          project: this.project
        });
      } else if (device.platform === 'android') {
        platformTarget = new AndroidTarget({
          device: device,
          project: this.project
        });
      }

      let framework = requireFramework(this.project);
      let reloadUrl = this.getReloadUrl(opts.port, opts.reloadUrl, framework);

      let createLivereloadShell = new CreateLiveReloadShell({
        project: this.project
      });

      let prepare = new CordovaRaw({
        project: this.project,
        api: 'prepare'
      });

      let hook = new Hook({
        project: this.project
      });

      return new Promise((resolve, reject) => {
        hook.run('beforeBuild')
          .then(() => editXml.addNavigation(this.project, reloadUrl))
          .then(() => cdvTarget.validateServe())
          .then(() => framework.validateServe(opts))
          .then(() => createLivereloadShell.run(reloadUrl))
          .then(() => prepare.run({ platforms: [device.platform] }))
          .then(function() {
            if (opts.skipCordovaBuild !== true) {
              return platformTarget.build();
            }
          })
          .then(() => hook.run('afterBuild'))
          .then(() => platformTarget.run())
          .then(() => {
            if (opts.skipFrameworkBuild !== true) {
              return framework.serve(opts, this.ui);
            }
          })
          .then(resolve).catch(reject);
      });
    });
  }
});
