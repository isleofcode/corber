const Command          = require('./-command');
const CordovaRaw       = require('../targets/cordova/tasks/raw');
const SanitizeArgs     = require('../targets/cordova/validators/addon-args');
const SetupWebView     = require('../targets/cordova/tasks/setup-webview');
const logger           = require('../utils/logger');

module.exports = Command.extend({
  name: 'platform',
  aliases: [ 'pl' ],
  description: 'Add/remove platforms',
  works: 'insideProject',

  /* eslint-disable max-len */
  availableOptions: [
    { name: 'save',                 type: Boolean,  default: true },
    { name: 'default-webview',      type: Boolean,  default: false },
    { name: 'crosswalk',            type: Boolean,  default: false },
    { name: 'uiwebview',            type: Boolean,  default: false },
    { name: 'link',                 type: String,  default: undefined }
  ],

  /* eslint-enable max-len */
  run(options, rawArgs) {
    this._super.apply(this, arguments);

    let cordovaArgValidator = new SanitizeArgs({
      rawArgs: rawArgs,
      api: 'platform'
    });

    let platformTask = new CordovaRaw({
      project: this.project,
      api: 'platforms'
    });

    //TODO - flatten validator /w SetupWebView
    return cordovaArgValidator.run()
      .then((validated) => {
        let action = validated.action;
        let opts = { save: options.save, link: options.link };

        logger.info(
          'Preparing to ' + action + ' platform ' + rawArgs
        );

        return platformTask.run(validated.action, validated.name, opts)
          .then(() => {
            //By default we upgrade the default WebView
            let platform = validated.name;

            if (action === 'add') {
              let setup = new SetupWebView({
                project: this.project,
                platform: platform,
                crosswalk: options.crosswalk,
                uiwebview: options.uiwebview
              });

              return setup.run();
            }
          });
      }).catch(function(err) {
        logger.error(err);
      });
  }
});
