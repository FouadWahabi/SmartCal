var helpers = require('../helpers.js');
var app = require('../../server/server');
var Validator = require('jsonschema').Validator;
var loopback = require('loopback');

module.exports = function(schema) {
  // hinding all remote methods
  helpers.disableAllMethods(schema);

  // get schema
  schema.getSchema = function(id, cb) {
    schema.findById(id, function(err, schema) {
      if(schema != null) {
        cb(null, schema);
      } else {
        cb(helpers.SCHEMA_NOT_FOUND, {});
      }
    });
  }

  schema.remoteMethod('getSchema', {
    accepts: [
      {arg: 'id', type: 'string'},
    ],
    returns: { type: 'string', root: true },
    http: {path:'/getSchema', verb: 'get'}
  });

  schema.getSchemas = function(cb) {
  // list schemas
    schema.find({}, cb);
  }

  schema.remoteMethod('getSchemas', {
    accepts: [
    ],
    returns: { type: 'object', root: true },
    http: {path:'/getSchemas', verb: 'get'}
  });

  // set scheduler Schema
  schema.insertSchema = function(schema, cb) {
    app.models.schema.create({schema: schema}, cb);
  }

  schema.remoteMethod('insertSchema', {
    accepts: [
      {arg: 'schema', type: 'object'}
    ],
    returns: { type: 'string', root: true },
    http: {path:'/insertSchema', verb: 'post'}
  });

};
