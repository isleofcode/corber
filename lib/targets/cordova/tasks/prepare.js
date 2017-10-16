const Task            = require('../../../tasks/-task');
const CordovaRaw      = require('./raw');
const logger          = require('../../../utils/logger');

module.exports = Task.extend({
  project: undefined,
  verbose: false,

  run() {
    logger.info('Running cordova prepare');
    let prepare = new CordovaRaw({
      project: this.project,
      api: 'prepare',
    });

    return prepare.run({ verbose: this.verbose });
  }
});
