const RSVP             = require('rsvp');
const childProcess     = require('child_process');

const EXIT_CODE_NOT_FOUND = 127;

module.exports = function(command, args = [], processOpts = {}, opts = {}) {
  let { onStderr, onStdout, cwd, fork } = opts;
  let processPath;

  if (cwd) {
    processPath = process.cwd();
    process.chdir(cwd);
  }

  let deferred = RSVP.defer();

  let spawned;
  if (fork) {
    // pipe fork output to stdout/stderr streams
    processOpts.silent = true;

    spawned = childProcess.fork(command, args, processOpts);
  } else {
    spawned = childProcess.spawn(command, args, processOpts);
  }

  let stdoutLines = [];
  let stderrLines = [];

  spawned.stdout.on('data', (data) => {
    stdoutLines.push(data);

    if (onStdout) {
      onStdout(data.toString());
    }
  });

  spawned.stderr.on('data', (data) => {
    stderrLines.push(data);

    if (onStderr) {
      onStderr(data.toString());
    }
  });

  spawned.on('exit', (code) => {
    if (code === EXIT_CODE_NOT_FOUND) {
      deferred.reject(`command '${command}' not found`);
      return;
    }

    deferred.resolve({
      stdout: stdoutLines.join('\n'),
      stderr: stderrLines.join('\n'),
      code
    });
  });

  spawned.on('error', (err) => {
    deferred.reject(err);
  });


  if (processPath) {
    deferred.promise.finally(() => {
      process.chdir(processPath);
    });
  }

  return deferred.promise;
};
