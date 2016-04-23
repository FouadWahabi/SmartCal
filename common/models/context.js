var helpers = require('../helpers.js');
var app = require('../../server/server');

module.exports = function(Context) {
  // hinding all remote methods
  helpers.disableAllMethods(Context);

};
