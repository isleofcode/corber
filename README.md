#ember-cordova (beta)

ember-cordova simplifies building Cordova applications with Ember.js.

It includes a CLI for builds, hooks, device event bindings, and handles splash screens, icons and a growing number of supported Ember/Cordova plugin bindings.

1. Platforms & Requirements
2. Getting Started
3. Features and Documentation;
4. Upcoming Extensions;
5. Contributing;
6. Credits

It is a beta fork of ember-cli-cordova, but should have similar
stability. It includes new features discussed below.

##Platforms & Requirements

We require Ember 2.3 or greater. Supported Cordova platforms are iOS
and Android.

For support with older Ember versions, look at [ember-cli-cordova](https://github.com/poetic/ember-cli-cordova)

##Getting Started

If you are migrating from ember-cli-cordova, as a pre step move your
/cordova directory to /ember-cordova/cordova.


```
  ember install ember-cordova
```

You can optionally pass name & cordovaid params, which will set the id &
display name of your Cordova application. If none exist, your Ember Apps
name will be used.

If you already have a Cordova project here it will not be overwritten.

Make sure your config.locationType is set to 'hash'.

As a final step, add your desired platforms, e.g.:

```
ember cdv platform add ios
ember cdv platform add android
```

Cordova working relies on the cordova.js script being injected. By default, this happens using ember cdv commands. Your vanilla ember build && ember s commands will not inject cordova.js by design.

##Features and Documentation
* [CLI](docs/cli.md)
* [Cordova Service & Event Bindings](docs/services/cordova.md)
* Device:
*  *  [Platform Service](docs/services/platform.md)
*  *  [Splash Screen Management](docs/services/splashscreen.md)
*  *  [Keyboard](docs/keyboard.md)
* [Icon Management](docs/services/icons.md)
* [Hooks](docs/hooks.md)
* [Live reload](docs/livereload.md)
* [Available Plugins](docs/plugins.md)

##Upcoming Extensions

We are working on four major items right now:

1. Improving test coverage;
2. Livereload improvements;
3. Bindings to Cordova Plugins [see plugins](docs/plugins.md); and
4. Either having ember install ember-cordova-plugin-foo install both the
ember addon & cordova plugin, or achieving the same through ember
cdv:install foo.

##Contributing

PRs are very welcome. You can read our style guides [here](https://github.com/isleofcode/style-guide).

If you are unsure about your contribution idea, please feel free to
open an Issue for feedback.

##Credits

ember-cordova is maintained by [Isle of Code](https://isleofcode.com), and started as a fork of [ember-cli-cordova](https://github.com/poetic/ember-cli-cordova).
