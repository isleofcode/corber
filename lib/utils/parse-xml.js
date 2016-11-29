var xml2js          = require('xml2js');
var Promise         = require('ember-cli/lib/ext/promise');

var fsUtils         = require('./fs-utils');
var logger          = require('./logger');

module.exports = function parseXML(xmlPath) {
  return new Promise(function(resolve) {
    fsUtils.read(xmlPath, { encoding: 'utf8' }).then(function(contents) {
      var parser = new xml2js.Parser();

      parser.parseString(contents, function (err, result) {
        if (err) {
          logger.error(err);
        }

        if (result) {
          resolve(result);
        }
      });
    });
  });
};
