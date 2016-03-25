#ember-cordova

ember-cordova simplifies building Cordova applications with Ember.js.

It includes a CLI for builds, hooks, device event bindings, and handles splash screens, icons and a growing number of supported Ember/Cordova plugin bindings.

1) Platforms & Requirements
2) Getting Started
3) Features and Documentation;
4) Upcoming Extensions;
5) Contributing;
6) Credits

##Platforms & Requirements

We require Ember 2.3 or greater. Supported Cordova platforms are iOS
and Android.

For support with older Ember versions, look at [ember-cli-cordova](https://github.com/poetic/ember-cli-cordova)

##Getting Started

```
  ember install ember-cordova
```

Installing will init a Cordova project for you at
ember-cordova/cordova, with your Ember Apps name as the Cordova App name.
If you already have a Cordova project here it will not be overwritten.

As a final step, add your desired platforms, e.g.:

```
ember cdv platform add ios
ember cdv platform add android
```

##Features and Documentation
* [CLI](docs/cli.md)
* [Cordova Service & Event Bindings](docs/services/cordova.md])
* Device:
*  *  [Platform Service](docs/services/platform.md)
*  *  [Splash Screen Management](docs/services/splash.md)
* [Icon Management](docs/services/icons.md)
* [Hooks](docs/hooks.md)
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
