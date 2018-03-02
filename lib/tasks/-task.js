const Task = require('ember-cli/lib/models/task');

module.exports = Task.extend({
  init() {
    this._super.apply(this, arguments);

    process.env.CORBER = true;
  }
});
