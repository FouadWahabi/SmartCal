var helpers = require('../helpers.js');
var app = require('../../server/server');

module.exports = function(Action) {
  // hinding all remote methods
  helpers.disableAllMethods(Action);

};
