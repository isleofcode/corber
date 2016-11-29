var td              = require('testdouble');
var fsUtils         = require('../../../lib/utils/fs-utils');
var createGitkeep   = require('../../../lib/utils/create-gitkeep');


describe('Create gitkeep util', function() {
  beforeEach(function() {
    td.reset();
  });

  it('attempts to write an empty gitkeep file', function() {
    var writeDouble = td.replace(fsUtils, 'write');
    createGitkeep('fooPath');

    td.verify(writeDouble('fooPath', '', { encoding: 'utf8' }));
  });
});
