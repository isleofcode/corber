var Task            = require('./-task');
var fsUtils         = require('../utils/fs-utils');
var logger          = require('../utils/logger');
var Promise         = require('ember-cli/lib/ext/promise');

var ignorePaths = [
  'ember-cordova/cordova/platforms/',
  'ember-cordova/cordova/plugins/',
  'ember-cordova/cordova/www/'
];

module.exports = Task.extend({
  project: undefined,

  run: function() {
    logger.info('ember-cordova: updating .gitignore');

    var ignoreContent = '\n';
    ignoreContent += 'ember-cordova/tmp-livereload\n';

    var itemsLength = ignorePaths.length;
    while (itemsLength--) {
      var item = ignorePaths[itemsLength];
      ignoreContent += item + '*\n';

      var gitkeepPath = item + '.gitkeep';
      ignoreContent += '!' + gitkeepPath + '\n';

      //create empty .gitkeep
      fsUtils.write(gitkeepPath, '', { encoding: 'utf8' });
    }

    return fsUtils.append('.gitignore', ignoreContent)
      .catch(function(err) {
        return Promise.reject('failed to update .gitignore, err: ' + err);
      })
  }
});
