'use strict';

var td              = require('testdouble');
var expect          = require('../../../helpers/expect');
var mockProject     = require('../../../fixtures/ember-cordova-mock/project');
var logger          = require('../../../../lib/utils/logger');
var contains        = td.matchers.contains;

var ValidateRoot    = require('../../../../lib/tasks/validate/root-url');

describe('Validate Root Url', function() {
  var validateRoot;

  beforeEach(function() {
    validateRoot = new ValidateRoot({
      project: mockProject.project,
      ui: mockProject.ui,
    });
  });

  afterEach(function() {
    td.reset();
  });

  it('resolves', function() {
    td.replace(validateRoot, 'validRootValues', function(path) {
      return true;
    });

    return expect(validateRoot.run(mockProject.config())).to.be.fulfilled;
  });

  it('runs invalidIndex if validRootValues is false', function() {
    td.replace(validateRoot, 'validRootValues', function(path) {
      return false;
    });

    validateRoot.invalidIndex = td.function();
    validateRoot.run(mockProject.config());
    td.verify(validateRoot.invalidIndex());
  });

  it('when force is true, throws a warning vs rejection', function() {
    td.replace(validateRoot, 'validRootValues', function(path) {
      return false;
    });

    var warnDouble = td.replace(logger, 'warn');

    return validateRoot.run(mockProject.config(), true).then(function() {
      td.verify(warnDouble(contains('You have passed the --force flag')));
    })
  });

  it('invalidIndex rejects with an error', function() {
    td.replace(validateRoot, 'validRootValues', function(path) {
      return false;
    });

    expect(function() {
      validateRoot.invalidIndex()
    }).to.throw(
      /{\{rootURL\}\} or \{\{baseURL\}\} in app\/index.html has a leading slash/
    );
  });

  describe('validRootValues', function() {
    it('returns false if any values lead with /', function() {
      var values = ['valid', '/invalid'];
      expect(validateRoot.validRootValues(values)).to.equal(false);
    });

    it('returns true if no values lead with /', function() {
      var values = ['valid', 'invalid'];
      expect(validateRoot.validRootValues(values)).to.equal(true);
    });
  });
});
