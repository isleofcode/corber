'use strict';

var childProcess = require('child_process');

var isUsingWindows = process.platform === 'win32';

module.exports = function(commandName) {
  var cmdStr;

  if (isUsingWindows) {
    cmdStr = 'where ' + commandName;
  } else {
    cmdStr = 'command -v ' + commandName +
      ' >/dev/null && { echo >&1 \'command found\'; }';
  }

  try {
    childProcess.execSync(cmdStr);
    return true;
  }
  catch (err) {
    return false;
  }
};
