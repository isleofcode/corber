/* global navigator */
import Ember from 'ember';

const {
  Service,
  inject,
  isPresent
} = Ember;

export default Service.extend({
  cordova: inject.service('cordova'),
  splashSelector: '#splashcreen',

  hide() {
    this.get('cordova').ready()
      .then(() => {
        if (isPresent(navigator) && isPresent(navigator.splashscreen)) {
          navigator.splashscreen.hide();
        }
      });
  },

  show() {
    this.get('cordova').ready()
      .then(() => {
        if (isPresent(navigator) && isPresent(navigator.splashscreen)) {
          navigator.splashscreen.show();
        }
      });
  }
});
