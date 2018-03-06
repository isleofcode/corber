const EmberCordovaError = function(content) {
  let message = content.message ? content.message : content;
  let stack = content.stack ? content.stack : (new Error()).stack;

  this.name = 'CorberError';
  this.message = message;
  this.stack = stack.substr(stack.indexOf('\n') + 1);
};

EmberCordovaError.prototype = Object.create(Error.prototype);
EmberCordovaError.prototype.toString = function() {
  return `Corber: ${this.message}`;
};
EmberCordovaError.constructor = EmberCordovaError;

module.exports = EmberCordovaError;
