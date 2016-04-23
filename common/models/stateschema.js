var helpers = require('../helpers.js');
var app = require('../../server/server');

module.exports = function(StateSchema) {
  // hinding all remote methods
  helpers.disableAllMethods(StateSchema);

  // get state schema
  StateSchema.getStateSchema = function(id, cb) {
    StateSchema.findById(id, function(err, stateschema) {
      if(stateschema != null) {
        cb(null, stateschema);
      } else {
        cb(helpers.STATE_SCHEMA_NOT_FOUND, {});
      }
    });
  }
  StateSchema.remoteMethod('getStateSchema', {
    accepts: [
      {arg: 'id', type: 'string'},
    ],
    returns: { type: 'string', root: true },
    http: {path:'/getStateSchema', verb: 'get'}
  });

  // insert StateSchema
  StateSchema.insertStateSchema = function(schema, cb) {
    app.models.stateschema.create({schema: schema}, cb);
  }

  StateSchema.remoteMethod('insertStateSchema', {
    accepts: [
      {arg: 'schema', type: 'object'}
    ],
    returns: { type: 'string', root: true },
    http: {path:'/insertStateSchema', verb: 'post'}
  });

};
