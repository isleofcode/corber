var chalk           = require('chalk');

module.exports = {
  info: function(message) {
    console.log(message);
  },

  success: function(message) {
    console.log(chalk.green(message));
  },

  warn: function(content) {
    var message = 'WARNING: ember-cordova \n';
    message += content;
    console.log(chalk.yellow(message));
  },

  error: function(content) {
    var message = 'ERROR: ember-cordova \n';
    message += content;
    throw new Error(chalk.red(message));
  }
};
