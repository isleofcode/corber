var fs              = require('fs');
var RSVP            = require('rsvp')

var denodeify       = RSVP.denodeify
var fsReadFile      = denodeify(fs.readFile)
var fsWriteFile     = denodeify(fs.writeFile);
var fsMkdir         = denodeify(fs.mkdir);
var fsAppend        = denodeify(fs.appendFile);

module.exports = {
  read: function() {
    return fsReadFile.apply(this, arguments);
  },

  write: function() {
    return fsWriteFile.apply(this, arguments);
  },

  existsSync: function() {
    return fs.existsSync.apply(this, arguments);
  },

  mkdir: function() {
    return fsMkdir.apply(this, arguments);
  },

  append: function() {
    return fsAppend.apply(this, arguments);
  }
}
