const Builder          = require('ember-cli/lib/models/builder');
const Task             = require('../../../tasks/-task');
const createGitkeep    = require('../../../utils/create-gitkeep');

/* eslint-disable max-len */
const willInterruptProcess  = require('ember-cli/lib/utilities/will-interrupt-process');
/* eslint-enable max-len */

module.exports = Task.extend({
  project: undefined,
  environment: undefined,
  outputPath: undefined,

  initBuilder() {
    return new Builder({
      project: this.project,
      environment: this.environment,
      outputPath: this.outputPath,
      onProcessInterrupt: willInterruptProcess
    });
  },

  run() {
    let builder = this.initBuilder.apply(this);

    return builder.build().then(function() {
      return createGitkeep('corber/cordova/www/.gitkeep');
    });
  }
});
