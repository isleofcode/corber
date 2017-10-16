const Task            = require('../../../tasks/-task');
const RSVP            = require('rsvp');
const Promise         = RSVP.Promise;
const cordovaPath     = require('../utils/get-path');
const cordovaLib      = require('cordova-lib');
const cordovaProj     = cordovaLib.cordova;
const events          = cordovaLib.events;
const cordovaLogger   = require('cordova-common').CordovaLogger.get();

module.exports = Task.extend({
  project: undefined,
  api: undefined,

  cordovaPromise(/* rawArgs */) {
    let args = Array.prototype.slice.call(arguments);
    let defer = new RSVP.defer();
    args.push(function() {
      return defer.resolve();
    });

    cordovaProj[this.api].apply(this, args);

    return defer.promise;
  },

  run() {
    let args = arguments;
    return new Promise((resolve, reject) => {
      let emberPath = process.cwd();
      process.chdir(cordovaPath(this.project));

      cordovaLogger.subscribe(events);
      if (args[0] && args[0].verbose) { cordovaLogger.setLevel('verbose'); }

      //Much of cordova-lib has a hardcoded process.cwd()
      //This won't work for us
      return this.cordovaPromise.apply(this, args).then(function() {
        process.chdir(emberPath);
        resolve();
      }).catch(function(err) {
        reject(err);
      });
    });
  }
});
