var loopback = require('loopback');
var Validator = require('schema-validator');
var helpers = require('../helpers.js');
var app = require('../../server/server');

module.exports = function(Config) {
  // hinding all remote methods
  helpers.disableAllMethods(Config);

  // insert Config
  Config.insertConfig = function(config, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    // retrieve current Config schema
    app.models.Context.findOne({where: {ownerId: accessToken.userId}, include: ['scheduler']}, function(err, context) {
      if(context != null) {
        app.models.configschema.findOne({where: {ConfigchemaId: context.scheduler().configchemaId}}, function(err, configschema) {
          if(configschema != null) {
            var validator = new Validator(configschema.schema);
            var check = validator.check(config);
            if(!check._error) {
              Config.create({ownerId: accessToken.userId, configschemaId: configschema.id, vars: config}, function(err, config) {
                app.models.User.setCurrentConfig(config.id, cb);
              });
            } else {
              cb(helpers.CONFIG_INSERTION_FAILED, {});
            }
          } else {
            cb(helpers.CONFIG_SCHEMA_NOT_FOUND, {});
          }
        });
      } else {
        cb(helpers.CONTEXT_NOT_FOUND, {});
      }
    });
  }

  Config.remoteMethod('insertConfig', {
    accepts: [
      { arg: 'config', type: 'object', http: { source: 'body' } },
    ],
    returns: { type: 'string', root: true },
    http: {path:'/insertConfig', verb: 'post'}
  });

};
