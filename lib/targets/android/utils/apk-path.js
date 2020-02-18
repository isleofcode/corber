const path            = require('path');
const spawn           = require('../../../utils/spawn');
const RSVP            = require('rsvp');
const Promise         = RSVP.Promise;
const fs              = require('fs');
const util           = require('util');

const readdir = util.promisify(fs.readdir);

const readAndReturnDir = function(dir){
  return readdir(dir).then(files => {
    return {
      files,
      dir
    };
  })
}

const isApk = function(filename) {
  return filename.match(/apk/);
};

module.exports = function(root, isDebug) {
  let buildType;
  isDebug ? buildType = 'debug' : buildType = 'release';

  //directory differs if build was with gradle vs studio
  /* eslint-disable max-len */
  let basePath = path.join(root, 'platforms', 'android');
  let gradlePath = path.join(basePath, 'build', 'outputs', 'apk', buildType);
  let studioPath = path.join(basePath, 'app', 'build', 'outputs', 'apk', buildType);
  /* eslint-enable max-len */

  let lookups = [];
  lookups.push(readAndReturnDir(gradlePath));
  lookups.push(readAndReturnDir(studioPath));

  return RSVP.allSettled(lookups).then(function(promises) {
    //Loop through each of the results in the promise list
    for (let result of promises) {
      //Only for working promises
      if (result.state === 'fulfilled') {
        let {
          files,
          dir
        } = result.value;
        //The promise returns a list of filenames, loop through them
        for (let name of files) {
          //Check if the file is an apk
          if (isApk(name)) {
            //Add the file to the path and return it
            return path.join(dir, name);
          }
        }
      }
    }
    //Otherwise reject the promise because we have no apks
    return Promise.reject('No apk found');
  });
};
