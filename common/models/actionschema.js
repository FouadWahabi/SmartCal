var helpers = require('../helpers.js');
var app = require('../../server/server');

module.exports = function(actionschema) {
  // hinding all remote methods
  helpers.disableAllMethods(actionschema);

  // get action schema
  actionschema.getActionSchema = function(id, cb) {
    actionschema.findById(id, function(err, actionschema) {
      if(actionschema != null) {
        cb(null, actionschema);
      } else {
        cb(helpers.ACTION_SCHEMA_NOT_FOUND, {});
      }
    });
  }
  actionschema.remoteMethod('getActionSchema', {
    accepts: [
      {arg: 'id', type: 'string'},
    ],
    returns: { type: 'string', root: true },
    http: {path:'/getActionSchema', verb: 'get'}
  });

  // set ActionSchema
  actionschema.insertActionSchema = function(schema, cb) {
      app.models.actionschema.create({schema: schema}, cb);
  }

  actionschema.remoteMethod('insertActionSchema', {
    accepts: [
      {arg: 'schema', type: 'object'}
    ],
    returns: { type: 'string', root: true },
    http: {path:'/insertActionSchema', verb: 'post'}
  });

};
