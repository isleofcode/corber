'use strict';

const td            = require('testdouble');
const childProcess  = require('child_process');
const BashTask      = require('../../../lib/tasks/bash');

const mockProject   = require('../../fixtures/ember-cordova-mock/project');
const defaults      = require('lodash').defaults;
const isObject      = td.matchers.isA(Object);
const isFunction    = td.matchers.isA(Function);

describe('Bash Task', () => {
  let command, options, execDouble, bashTask;

  beforeEach(() => {
    command = 'foo';
    options = { cwd: '/path/to/project' };
    execDouble = td.replace(childProcess, 'exec');

    bashTask = new BashTask(defaults(mockProject, {
      command: command,
      options: options
    }));
  });

  afterEach(() => {
    td.reset();
  });

  it('attempts to exec cmd', () => {
    bashTask.run();
    td.verify(execDouble('foo', options, isFunction));
  });
});
