import Ember from 'ember';

const {
  Mixin,
  get,
  inject,
  on
} = Ember;

export default Mixin.create({
  cordova: inject.service(),

  subscribeToCordovaEvents: on('init', function() {
    const cordova = this.get('cordova'),
          onCordova = this.get('onCordova');

    Object.keys(onCordova).forEach(key => {
      const func = get(onCordova, key);

      if (func instanceof Array) {
        func.filter(this._validateIsFunction, this)
          .forEach(fn => {
            cordova.on(key, this, fn);
          });
      } else if (this._validateIsFunction(func)) {
        cordova.on(key, this, func);
      }
    }, this);
  }),

  _validateIsFunction: function(func) {
    if (func instanceof Function) { return true; }
    if (typeof func === 'string') { return this.get(func) instanceof Function; }

    return false;
  }
});
