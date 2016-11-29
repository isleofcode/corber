var Builder         = require('ember-cli/lib/models/builder');
var Task            = require('./-task');
var createGitkeep   = require('../utils/create-gitkeep');


module.exports = Task.extend({
  project: undefined,
  environment: undefined,
  outputPath: undefined,

  initBuilder: function() {
    return new Builder({
      project: this.project,
      environment: this.environment,
      outputPath: this.outputPath
    });
  },

  run: function() {
    var builder = this.initBuilder.apply(this);

    return builder.build().then(function() {
      return createGitkeep('ember-cordova/cordova/www/.gitkeep');
    });
  }
});
