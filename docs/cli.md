## CLI

All commands follow the pattern `ember cordova:{command}`. You can use the `cdv` alias
insted of`cordova`, for example `ember cdv:{command}`.

You can pass a command to cordova without
ember-cordova interference with ember cdv build, vs. ember cdv:build.

### Available Commands
* ember cdv:open
* ember cdv:build
* ember cdv:link
* ember cdv:prepare
* ember cordova

### Open

#### Description

Open the native platform project with the default or specified application

#### Available options
+ platform (default:ios)
+ application (default:system default application)

#### Examples
+ `ember cordova:open`
+ `ember cordova:open --platform=android --application=eclipse`


### Build

#### Description

Build the ember and cordova project together running in the simulator or on a device

#### Available options
+ environment (default:development)
+ platform (default:ios)

#### Examples
+ `ember cordova:build`
+ `ember cordova:build --environment=production --platform=ios`

### Link

#### Description
Symlinks your dist/ to Cordovas www. You generally won't need to run
this, as build will do this for you.

#### Examples
+ `ember cordova:link`

### Prepare

#### Description
Handles running prepare, but will also fire the
beforePrepare/afterPrepare hooks.

#### Examples
+ `ember cordova:prepare`

## Cordova

#### Description

Passes commands straight to cordova, without interference.

#### Examples
+ `ember cordova platform add ios`
