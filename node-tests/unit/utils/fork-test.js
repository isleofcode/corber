const td = require('testdouble');
const expect = require('../../helpers/expect');

describe('Fork', () => {
  let fork;
  let onStdout;
  let onStderr;
  let mockProcess;

  beforeEach(() => {
    onStdout = td.function('onStdout');
    onStderr = td.function('onStderr');

    mockProcess = {
      on: td.function('mockProcess.on'),
      stdout: {
        on: td.function('mockProcess.stdout.on')
      },
      stderr: {
        on: td.function('mockProcess.stderr.on')
      }
    };

    let childProcess = td.object(['fork']);
    td.replace('child_process', childProcess);

    // this stubbing is sufficient to test that args are passed to fork
    td.when(childProcess.fork('ls', ['["-l"]'], { silent: true }))
      .thenReturn(mockProcess);

    fork = require('../../../lib/utils/fork');
  });

  afterEach(() => {
    td.reset();
  });

  it('resolves on successful exit', () => {
    let promise = fork('ls', ['-l'], { onStdout, onStderr });

    let captor = td.matchers.captor();
    td.verify(mockProcess.on('exit', captor.capture()));

    // simulate successful exit
    captor.value(0);

    return expect(promise).to.eventually.be.fulfilled;
  });

  it('rejects on exit with error code', () => {
    let promise = fork('ls', ['-l'], { onStdout, onStderr });

    let captor = td.matchers.captor();
    td.verify(mockProcess.on('exit', captor.capture()));

    // simulate non-zero error code
    captor.value(1);

    return expect(promise).to.eventually.be.rejectedWith(1);
  });

  it('pipes output from stdout to supplied handler', () => {
    fork('ls', ['-l'], { onStdout, onStderr });

    let captor = td.matchers.captor();
    td.verify(mockProcess.stdout.on('data', captor.capture()));

    // simulate stdout data
    captor.value('message');
    td.verify(onStdout('message'));
  });

  it('pipes output from stderr to supplied handler', () => {
    fork('ls', ['-l'], { onStdout, onStderr });

    let captor = td.matchers.captor();
    td.verify(mockProcess.stderr.on('data', captor.capture()));

    // simulate stderr data
    captor.value('error');
    td.verify(onStderr('error'));
  });
});