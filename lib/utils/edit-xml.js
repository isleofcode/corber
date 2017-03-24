var cordovaPath  = require('./cordova-path');
var fs           = require('fs');
var parseXml     = require('./parse-xml');
var path         = require('path');
var xml2js       = require('xml2js');

var builder = new xml2js.Builder({
  renderOpts: {
    'pretty': true,
    'indent': '    ',
    'newline': '\n'
  }
});

module.exports = {
  addNavigation: function(project, host) {
    var cdvPath = cordovaPath(project);
    var configPath = path.join(cdvPath, 'config.xml');

    parseXml(configPath).then(function(json) {
      var navOptions = { $: { href: host, name: 'ec-nav' }};

      if (!json.widget['allow-navigation']) {
        json.widget['allow-navigation'] = [];
      }

      json.widget['allow-navigation'].push(navOptions);

      var xml = builder.buildObject(json);

      fs.writeFileSync(configPath, xml);
    });
  },

  removeNavigation: function(project, host) {
    var cdvPath = cordovaPath(project);
    var configPath = path.join(cdvPath, 'config.xml');

    parseXml(configPath).then(function(json) {
      var clientNavs = [];

      json.widget['allow-navigation'].forEach(function(nav) {
        if (nav.$.name !== 'ec-nav') {
          clientNavs.push(nav);
        }
      });

      json.widget['allow-navigation'] = [];

      clientNavs.forEach(function(nav) {
        json.widget['allow-navigation'].push(nav);
      });

      var xml = builder.buildObject(json);

      fs.writeFileSync(configPath, xml);
    });
  }
};
