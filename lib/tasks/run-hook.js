'use strict';

var fs              = require('fs-extra');
var path            = require('path');

var Task            = require('ember-cli/lib/models/task');
var PromiseExt      = require('ember-cli/lib/ext/promise');

var cordovaPath     = require('../utils/cordova-path');

var HookTask = Task.extend({
  project: undefined,
  ui: undefined,

  name: undefined,
  tasks: undefined,
  task: undefined,

  _tasks: function() {
    return this.tasks === undefined ?
      [this.task] :
      this.tasks;
  },

  run: function() {
    this.validateArgs();

    return this.hookForPrefix('before')
      .then(this.prepareInnerTasks())
      .then(this.prepareHookForPrefix('after'));
  },

  prepareHookForPrefix: function(prefix) {
    var task = this;

    return function _prepareHookForPrefix() {
      return task.hookForPrefix(prefix);
    };
  },

  prepareInnerTasks: function() {
    var task = this;

    return function _prepareInnerTasks() {
      return task.runInnerTasks();
    };
  },

  hookForPrefix: function(prefix) {
    var task, ui, name, hookPath, hook;

    task = this;
    ui = this.ui;
    name = this.name;
    hookPath = this._pathForHook(prefix);

    return new PromiseExt(function(resolve, reject) {
      if (fs.existsSync(hookPath)) {
        ui.writeLine('Located hook for: ' + name);

        try {
          hook = task.hookForPath(hookPath);
          ui.writeLine('Running hook for: ' + name);

          if (hook instanceof PromiseExt) {
            hook
              .then(resolve)
              .catch(reject);
          } else if (typeof hook === 'function') {
            hook();
            resolve();
          } else {
            reject(name + ' hook was not a function or Promise');
          }
        } catch (error) {
          reject(error);
        }
      } else {
        resolve();
      }
    });
  },

  runInnerTasks: function() {
    var tasks, runningTask;

    tasks = this._tasks();

    while (tasks.length > 0) {
      var task = tasks.shift();

      runningTask = runningTask === undefined ?
        task.run() :
        runningTask.then(task.run());
    }

    return runningTask;
  },

  validateArgs: function() {
    if (this.name === undefined) {
      throw new Error('`name` must be passed to HookedTask');
    }

    if (this.tasks === undefined && this.task === undefined) {
      throw new Error('`task` or `tasks` must be passed to HookedTask');
    }
  },

  _pathForHook: function(prefix) {
    var hookName, hooksDir, hookPath;

    hookName = prefix + '-' + this.name;
    hooksDir = path.join(cordovaPath(this.project, true), 'hooks');
    hookPath = path.join(hooksDir, hookName);

    return hookPath;
  }
});

HookTask.prototype.hookForPath = function(hookPath) {
  return require(hookPath);
};

module.exports = HookTask;
