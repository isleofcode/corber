'use strict';

const td            = require('testdouble');
const childProcess  = require('child_process');
const BashTask      = require('../../../lib/tasks/bash');

const mockProject   = require('../../fixtures/ember-cordova-mock/project');
const defaults      = require('lodash').defaults;
const isObject      = td.matchers.isA(Object);
const isFunction    = td.matchers.isA(Function);

describe('Bash Task', () => {
  let execDouble, bashCmd;

  beforeEach(() => {
    execDouble = td.replace(childProcess, 'exec');

    bashCmd = new BashTask(defaults(mockProject, {
      command: 'foo'
    }));

    bashCmd.run();
  });

  afterEach(() => {
    td.reset();
  });

  it('attempts to exec cmd', () => {
    td.verify(execDouble('foo', isObject, isFunction));
  });
});
