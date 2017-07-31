const Task             = require('../../../tasks/-task');
const BashTask         = require('../../../tasks/bash');
const AddCordovaJS     = require('../../../tasks/add-cordova-js');
const path             = require('path');

module.exports = Task.extend({
  buildCommand: undefined,
  buildPath: undefined,
  cordovaOutputPath: undefined,

  run() {
    let cordovaDist = path.join(this.buildPath, this.cordovaOutputPath);

    let build = new BashTask({
      command: this.buildCommand,
      options: {
        //TODO - needs to alwyas be project root
        cwd: process.cwd()
      }
    });

    let copy = new BashTask({
      command: `cp -R ${this.buildPath}/* ${this.cordovaOutputPath}`
    });

    let addCordovaJS = new AddCordovaJS({
      source: path.join(this.cordovaOutputPath, 'index.html')
    });

    return build.run()
      .then(copy.prepare())
      .then(addCordovaJS.prepare())
  }
});