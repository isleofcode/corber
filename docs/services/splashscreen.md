## Splashscreen Service

Included is a Splashscreen service, which works alongside Cordova's splashscreen
plugin to show / hide the native splashscreen.

There is also a mixin available to hide the splashscreen in a route's
`afterModel` hook.

### Usage

You probably want the mixin:

```js
// app/routes/application.js
import Ember from 'ember';
import SplashscreenMixin from 'ember-cordova/mixins/device/splashscreen';

const { Route } = Ember;

export default Route.extend(SplashscreenMixin, {
  // ...
});
```

### Service Location

```js
lookup('service:device/splashscreen');
```

### Service API

|   | Description |
|---|-------------|
|show | show the splashscreen|
|hide | hide the splashscreen|
