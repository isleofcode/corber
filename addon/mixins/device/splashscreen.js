import Ember from 'ember';

const {
  Mixin,
  inject
} = Ember;

export default Mixin.create({
  splashscreen: inject.service('device/splashscreen'),

  afterModel() {
    this.get('splashscreen').hide();

    return this._super(...arguments);
  }
});
