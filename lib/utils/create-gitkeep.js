var fsUtils         = require('./fs-utils');

module.exports = function(gitkeepPath) {
  return fsUtils.write(gitkeepPath, '', { encoding: 'utf8' });
}
