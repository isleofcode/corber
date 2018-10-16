const Command         = require('./-command');
const Hook            = require('../tasks/run-hook');
const logger          = require('../utils/logger');
const editXml         = require('../targets/cordova/utils/edit-xml');
const getNetworkIp    = require('../utils/get-network-ip');
const requireTarget   = require('../utils/require-target');
const requireFramework = require('../utils/require-framework');
const Promise          = require('rsvp').Promise;

const CreateLiveReloadShell   = require('../tasks/create-livereload-shell');

module.exports = Command.extend({
  name: 'serve',
  aliases: [ 's' ],
  description: 'Builds app, then runs liveReload server',

  /* eslint-disable max-len */
  availableOptions: [
    { name: 'platform',             type: String,  default: 'ios' },
    { name: 'reload-url',           type: String,                          aliases: ['r'] },
    { name: 'verbose',              type: Boolean, default: false,         aliases: ['v'] },
    { name: 'port',                 type: Number,                          aliases: ['p'] },
    { name: 'host',                 type: String,                          aliases: ['H'],     description: 'Listens on all interfaces by default' },
    { name: 'proxy',                type: String,                          aliases: ['pr', 'pxy'] },
    { name: 'insecure-proxy',       type: Boolean, default: false,         aliases: ['inspr'], description: 'Set false to proxy self-signed SSL certificates' },
    { name: 'transparent-proxy',    type: Boolean, default: true,          aliases: ['transp'], description: 'Set to false to omit x-forwarded-* headers when proxying' },
    { name: 'watcher',              type: String,  default: 'events',      aliases: ['w'] },
    { name: 'live-reload',          type: Boolean, default: true,          aliases: ['lr'] },
    { name: 'live-reload-host',     type: String,                          aliases: ['lrh'],   description: 'Defaults to host' },
    { name: 'live-reload-base-url', type: String,                          aliases: ['lrbu'],  description: 'Defaults to baseURL' },
    { name: 'live-reload-port',     type: Number,                          aliases: ['lrp'],   description: '(Defaults to port number within [49152...65535])' },
    { name: 'environment',          type: String,  default: 'development', aliases: ['e', 'env', { 'dev': 'development' }, { 'prod': 'production' }] },
    { name: 'ssl',                  type: Boolean, default: false },
    { name: 'ssl-key',              type: String,  default: 'ssl/server.key' },
    { name: 'ssl-cert',             type: String,  default: 'ssl/server.crt' },
    { name: 'force',                type: Boolean, default: false },
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

  run(opts) {
    this._super.apply(this, arguments);

    logger.info(`
      corber start is a new command that integrates serve -
      with automated emulator booting/deployment. \n
      It currently only supports emulators, with device support coming soon. \n
      If your workflow involves emulators we suggest using the new command.
    `);

    let framework = requireFramework(this.project);
    let cordovaTarget = requireTarget(this.project, opts);

    //lets for live reload addon service
    process.env.CORBER_PLATFORM = opts.platform;
    process.env.CORBER_LIVERELOAD = true;

    // allows platform-specific tuning in framework build pipeline
    this.project.CORBER_PLATFORM = opts.platform;

    let hook = new Hook({
      project: this.project
    });

    let setupLivereload = new CreateLiveReloadShell({
      project: this.project
    });

    let reloadUrl = this.getReloadUrl(opts.port, opts.reloadUrl, framework);
    let project = this.project;

    return new Promise((resolve, reject) => {
      editXml.addNavigation(project, reloadUrl)
        .then(() => hook.run('beforeBuild', opts))
        .then(() => cordovaTarget.validateServe())
        .then(() => framework.validateServe(opts))
        .then(() => setupLivereload.run(reloadUrl))
        .then(function() {
          if (opts.skipCordovaBuild !== true) {
            return cordovaTarget.build();
          }
        })
        .then(() => hook.run('afterBuild', opts))
        .then(function() {
          if (opts.skipFrameworkBuild !== true) {
            return framework.serve(opts);
          }
        })
        .then(function() {
          editXml.removeNavigation(project, reloadUrl);
        })
        .then(resolve)
        .catch(function(e) {
          logger.error(e);
          reject(e);
        });
    });
  }
});
