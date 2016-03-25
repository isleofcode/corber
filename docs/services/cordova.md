## Events

### Description

ember-cordova creates a service a cordova service, which listens for
events defined and emitted by Cordova (e.g. `deviceready`, `pause`, `resume`).

### Usage

**Simple Usage:**

Many events require only simple callbacks, e.g. pausing / resuming listener
functions, logging the event, etc.

In these cases use the provided mixin, which will
look for an `onCordova` object and run the provided functions when an event
matching the key is emitted. For example:

```js
import Ember from 'ember';
import CordovaEventsMixin from 'ember-cordova/mixins/events';

const { Route } = Ember;

export default Route.extend(
  CordovaEventsMixin, {

  activate(...args) {
    this._super(args);
    console.log('hiya');
  },

  onCordova: {
    pause: 'logPause',
    resume: ['logResume', 'incrementCounter'],
    volumeupbutton() { alert('a little bit louder now'); }
  },

  logPause() { console.log('paused'); },
  logResume() { console.log('resumed'); },

  counter: 0,
  incrementCounter() { this.incrementProperty('counter'); }
});
```

(Yes, `onCordova` supports arrays of named functions, single named functions,
and anonymous functions!)

**Advanced Usage:**

If you have more advanced needs, e.g. turning on/off an event subscription when
an `Ember.Route` is activated/deactivated, or just prefer a more manual
approach, you can inject the provided service and tinker away:

```javascript
const {
  Route,
  inject
} = Ember;

export default Route.extend({
  cordova: inject.service(),

  activate: function() {
    // use named function to unsubscribe later
    this.get('cordova').on('pause', this, '_resumeListening');
  },

  deactivate: function() {
    this.get('cordova').off('pause', this, '_resumeListening');
  },

  _resumeListening: function() {
    console.log('do your thing');
  }
});
```
