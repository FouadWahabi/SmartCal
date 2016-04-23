module.exports = function(configschema) {

  // get config schema
  configschema.getConfigSchema = function(id, cb) {
    configschema.findById(id, function(err, configschema) {
      if(configschema != null) {
        cb(null, configschema);
      } else {
        cb(helpers.CONFIG_SCHEMA_NOT_FOUND, {});
      }
    });
  }
  configschema.remoteMethod('getConfigSchema', {
    accepts: [
      {arg: 'id', type: 'string'},
    ],
    returns: { type: 'string', root: true },
    http: { path:'/getConfigSchema', verb: 'get' }
  });

  // insert ConfigSchema
  configschema.insertConfigSchema = function(schema, cb) {
      app.models.configschema.create({schema: schema}, cb);
  }

  configschema.remoteMethod('insertConfigSchema', {
    accepts: [
      {arg: 'schema', type: 'object'}
    ],
    returns: { type: 'string', root: true },
    http: {path:'/insertConfigSchema', verb: 'post'}
  });

};
