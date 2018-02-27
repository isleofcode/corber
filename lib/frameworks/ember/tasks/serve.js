/*
 Largely taken from: https://github.com/ember-cli/ember-cli/blob/master/lib/tasks/serve.js
 We simply need the Serve task without the hang build into ember-clis Task*

 We pass a mock analytics object, because we are importing ember-cli models

 That conflicts with our analyics. #TODO - better solution
*/

/* eslint-disable max-len */
const LiveReloadServer = require('ember-cli/lib/tasks/server/livereload-server');
const ExpressServer    = require('ember-cli/lib/tasks/server/express-server');
const RSVP             = require('rsvp');
const Promise          = RSVP.Promise;
const Task             = require('../../../tasks/-task');
const Watcher          = require('ember-cli/lib/models/watcher');
const Builder          = require('ember-cli/lib/models/builder');
const clone            = require('lodash').clone;
const chalk            = require('chalk');
const rimraf           = require('rimraf');
const Funnel           = require('broccoli-funnel');
const logger           = require('../../../utils/logger');
const editXml          = require('../../../targets/cordova/utils/edit-xml');
const cordovaAssets    = require('../../../targets/cordova/utils/cordova-assets');
const getPath          = require('../../../targets/cordova/utils/get-path');
const mockAnalytics    = require('../../../../node-tests/fixtures/corber-mock/analytics');
/* eslint-enable max-len */

module.exports = Task.extend({
  project: undefined,
  ui: undefined,
  analytics: undefined,

  //In livereload cordova_plugins/cordova.js will not resolve
  //Manually inject them into Embers funnel
  stubEmberAddon(cloneProject) {
    if (cloneProject.addons === undefined) { cloneProject.addons = []; }
    cloneProject.addons.push({
      treeFor(treeName) {
        if (treeName !== 'addon') { return; }

        let platform = cloneProject.CORBER_PLATFORM ||
                       cloneProject.CORDOVA_PLATFORM;
        let projectPath = getPath(cloneProject);
        let assets = cordovaAssets.getPaths(platform, projectPath);

        cordovaAssets.validatePaths(assets.assetsPath, projectPath);

        let pluginsTree = new Funnel('corber/cordova', {
          srcDir:  assets.assetsPath,
          include: assets.files
        });

        return pluginsTree;
      },
      pkg: {
        'ember-addon': {}
      },
      root: 'corber-livereload',
      name: 'corber-livereload',
      addons: []
    });

    return cloneProject;
  },

  run(options, ui, analytics) {
    this.cleanupOnExit();

    let cloneProject = clone(this.project);
    this.stubEmberAddon(cloneProject);

    let watcher = new Watcher({
      ui: this.ui,
      builder: new Builder({
        ui: this.ui,
        outputPath: 'corber/tmp-livereload',
        project: cloneProject,
        environment: options.environment
      }),
      analytics: mockAnalytics,
      options: options
    });

    let expressServer = new ExpressServer({
      ui: this.ui,
      project: cloneProject,
      watcher: watcher,
      serverRoot: './server',
    });

    let liveReloadServer = new LiveReloadServer({
      ui: this.ui,
      analytics: mockAnalytics,
      project: cloneProject,
      watcher: watcher,
      expressServer: expressServer
    });

    // h/t ember-cli, hang until user exit
    this._runDeferred = RSVP.defer();
    return new Promise((resolve, reject) => {
      Promise.all([
        liveReloadServer.start(options),
        expressServer.start(options),
        watcher.then()
      ]).then(() => {
        if (options.liveReload) {
          logger.success('corber: Device LiveReload is enabled');
        }

        return this._runDeferred.promise;
      }).then(resolve).catch(reject);
    });
  },

  cleanupOnExit() {
    process.on('SIGINT', function () {
      editXml.removeNavigation(this.project);

      logger.info(chalk.blue(
        'corber: Exiting, cleaning up tmp serve'
      ));

      try {
        rimraf.sync('corber/tmp-livereload');
      } catch (err) {
        logger.error(err);
      }

      return this._runDeferred.resolve()
    }.bind(this));
  }
});
