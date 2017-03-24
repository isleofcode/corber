var cordovaPath     = require('../../../lib/utils/cordova-path');
var editXml         = require('../../../lib/utils/edit-xml');
var expect          = require('../../helpers/expect');
var mockProject     = require('../../fixtures/ember-cordova-mock/project');
var parseXml        = require('../../../lib/utils/parse-xml');
var path            = require('path');

describe('Edit XML Util', function() {
  beforeEach(function() {
    editXml.removeNavigation(mockProject.project);
  });

  var totalNavNodes;
  var host = 'http://localhost:8080';

  describe('addNavigation function', function() {
    beforeEach(function() {
      editXml.addNavigation(mockProject.project, host);
    });

    it('add node to the xml file in addition to client nodes', function() {
      var cdvPath = cordovaPath(mockProject.project);
      var configPath = path.join(cdvPath, 'config.xml');

      parseXml(configPath).then(function(json) {
        totalNavNodes = json.widget['allow-navigation'];
        expect(totalNavNodes).to.equal(3);
      });
    });
  });

  describe('removeNavigation function', function() {
    describe('if nodes placed by util exist', function() {
      it('removes util placed nodes and keep client nodes', function() {
        beforeEach(function() {
          editXml.addNavigation(mockProject.project, host);
        });

        editXml.removeNavigation(mockProject.project);

        var cdvPath = cordovaPath(mockProject.project);
        var configPath = path.join(cdvPath, 'config.xml');

        parseXml(configPath).then(function(json) {
          totalNavNodes = json.widget['allow-navigation'];
          expect(totalNavNodes).to.equal(2);
        });
      });
    });
  });
});
