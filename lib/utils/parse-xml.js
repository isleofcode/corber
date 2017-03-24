var xml2js          = require('xml2js');
var Promise         = require('rsvp').Promise;

var fsUtils         = require('./fs-utils');
var logger          = require('./logger');

module.exports = function parseXML(xmlPath) {
  return new Promise(function(resolve) {
    var contents = fsUtils.readSync(xmlPath, { encoding: 'utf8' });
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
};
