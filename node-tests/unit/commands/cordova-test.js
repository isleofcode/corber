'use strict';

const td            = require('testdouble');
const expect        = require('../../helpers/expect');

const CordovaCmd    = require('../../../lib/commands/cordova');
const BashTask      = require('../../../lib/tasks/bash');

const mockProject   = require('../../fixtures/ember-cordova-mock/project');
const isObject      = td.matchers.isA(Object);


//TODO - kill Task
describe('Cordova Command', () => {
  let bashDouble;

  beforeEach(() => {
    CordovaCmd.ui = mockProject.ui;
    CordovaCmd.project = mockProject.project;

    bashDouble = td.replace(BashTask.prototype, 'runCommand');
  });

  afterEach(() => {
    td.reset();
  });

  it('warns if an ember-cordova command is used', () => {
    CordovaCmd.validateAndRun(['build']);
    expect(CordovaCmd.ui.output).to.contain('bypassed ember-cordova command');
  });

  it('warns if cordova command is unknown', () => {
    CordovaCmd.validateAndRun(['foo']);
    expect(CordovaCmd.ui.output).to.contain('unknown Cordova command');
  });

  it('proxies the command to cordova', () => {
    CordovaCmd.run({}, ['prepare']);
    td.verify(bashDouble('cordova prepare', isObject));
  });

  it('proxies multi argument commands', () => {
    CordovaCmd.run({}, ['plugin add foo']);
    td.verify(bashDouble('cordova plugin add foo', isObject));
  });
});
