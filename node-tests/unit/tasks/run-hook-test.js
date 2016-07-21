'use strict';

const fs            = require('fs-extra');
const td            = require('testdouble');
const path          = require('path');
const defaults      = require('lodash').defaults;

const PromiseExt    = require('ember-cli/lib/ext/promise');
const Task          = require('ember-cli/lib/models/task');

const expect        = require('../../helpers/expect');
const HookedTask    = require('../../../lib/tasks/run-hook');
const mockProject   = require('../../fixtures/ember-cordova-mock/project');

describe('Run Hook Task', () => {
  let taskName, passedTasks, hookedTask, runTasks;

  beforeEach(() => {
    taskName = 'foo';
    passedTasks = [];
    runTasks = [];

    passedTasks.push(mockPassedTask());
  });

  afterEach(() => {
    hookedTask = undefined;
    td.reset();
  });

  function mockPassedTask() {
    let n = passedTasks.length,
        task = new Task({
          prepare: function() {
            var task = this;
            var args = Array.prototype.slice.call(arguments);

            return function preparedTask() {
              return task.run.apply(task, args);
            };
          },

          run: function() {
            runTasks.push(n);

            return PromiseExt.resolve();
          }
        });

    return task;
  }

  function mockHookedTask(_options) {
    let options = defaults(_options, {
      project: mockProject.project,
      ui: mockProject.ui
    });

    return new HookedTask(options);
  }

  function runHookedTask() {
    return hookedTask.run();
  }

  context('when name is not passed', () => {
    beforeEach(() => {
      hookedTask = mockHookedTask({
        tasks: passedTasks
      });
    });

    it('throws', () => {
      expect(runHookedTask).to.throw(Error);
    });
  });

  context('when task/s are not passed', () => {
    beforeEach(() => {
      hookedTask = mockHookedTask({
        name: taskName
      });
    });

    it('throws', () => {
      expect(runHookedTask).to.throw(Error);
    });
  });

  context('when passed valid args', () => {
    beforeEach(() => {
      hookedTask = mockHookedTask({
        name: taskName,
        task: passedTasks[0]
      });
    });

    context('and passed multiple tasks', () => {
      let numTasks;

      beforeEach(() => {
        numTasks = 3;

        for (let i = 1; i < numTasks; i += 1) {
          passedTasks.push(mockPassedTask());
        }

        hookedTask.task = undefined;
        hookedTask.tasks = passedTasks;

        return hookedTask.run();
      });

      it('runs all tasks', () => {
        expect(runTasks.length).to.equal(numTasks);
      });

      it('runs tasks in order', () => {
        let lastTaskNum;

        for (let i = 0; i < numTasks; i += 1) {
          let currentTaskNum = runTasks.shift();

          if (lastTaskNum !== undefined) {
            expect(lastTaskNum).to.be.lessThan(currentTaskNum);
          }

          lastTaskNum = currentTaskNum;
        }
      });
    });

    context('and hooks do not exist', () => {
      it('fulfills', () => {
        return expect(runHookedTask()).to.eventually.be.fulfilled;
      });

      it('runs passed tasks', () => {
        return runHookedTask()
          .then(() => {
            expect(runTasks.length).to.equal(passedTasks.length);
          });
      });
    });

    context('when hooks exist', () => {
      beforeEach(() => {
        td.replace(fs, 'existsSync', function() {
          return true;
        });
      });

      // todo test before => tasks => after
      context('and implemented as a function', () => {
        let shouldThrow;

        beforeEach(() => {
          shouldThrow = false;

          td.replace(HookedTask.prototype, 'hookForPath', function(_path) {
            return function() {
              let hookName = path.basename(_path);

              if (shouldThrow) { throw new Error('i am an error'); }
              runTasks.push(hookName);
            };
          });
        });

        context('and succeeds', () => {
          it('fulfills', () => {
            return expect(runHookedTask()).to.eventually.be.fulfilled;
          });

          it('runs both hooks & at least one task', () => {
            return runHookedTask()
              .finally(() => {
                expect(runTasks.length).to.be.greaterThan(2);
              });
          });

          it('runs hooks & tasks in sequence', () => {
            return runHookedTask()
              .finally(() => {
                expect(runTasks.shift()).to.equal('before-' + taskName);
                expect(runTasks.pop()).to.equal('after-' + taskName);
              });
          });
        });

        context('and throws', () => {
          beforeEach(() => {
            shouldThrow = true;
          });

          it('rejects', () => {
            return expect(runHookedTask()).to.be.rejected;
          });

          it('runs no tasks', () => {
            return runHookedTask()
              .catch(() => {
                expect(runTasks.length).to.equal(0);
              });
          });
        });
      });

      context('and implemented as a promise', () => {
        let shouldReject;

        beforeEach(() => {
          shouldReject = false;

          td.replace(HookedTask.prototype, 'hookForPath', function() {
            return new PromiseExt((resolve, reject) => {
              if (shouldReject) { reject('i am an error'); }
              resolve();
            });
          });
        });

        context('and resolves', () => {
          it('fulfills', () => {
            return expect(runHookedTask()).to.be.fulfilled;
          });
        });

        context('and rejects', () => {
          beforeEach(() => {
            shouldReject = true;
          });

          it('rejects', () => {
            return expect(runHookedTask()).to.be.rejected;
          });
        });
      });

      context('and are implemented neither as a function nor a promise', () => {
        beforeEach(() => {
          td.replace(HookedTask.prototype, 'hookForPath', function() {
            return 'they call me Sittin\' Terry cuz i sit & never run';
          });
        });

        it('rejects', () => {
          return expect(runHookedTask()).to.be.rejected;
        });
      });
    });
  });
});
