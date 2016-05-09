var loopback = require('loopback');
var Validator = require('jsonschema').Validator;
var helpers = require('../helpers.js');
var app = require('../../server/server');
var requestify = require('requestify');

module.exports = function(Config) {
  // hinding all remote methods
  helpers.disableAllMethods(Config);

  // insert Config
  Config.insertConfig = function(configVars, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    // retrieve current Config schema
    app.models.Context.findOne({where: {ownerId: accessToken.userId}, include: ['scheduler']}, function(err, context) {
      if(context != null) {
        app.models.schema.findOne({where: {id: context.scheduler().configchemaId}}, function(err, configschema) {
          if(configschema != null) {
            var validator = new Validator();
            var check = validator.validate(configVars, configschema.schema);
            if(check.errors.length === 0) {
              Config.create({ownerId: accessToken.userId, schemaId: configschema.id, vars: configVars}, function(err, config) {
                // set current config
                app.models.User.setCurrentConfig(config.id, cb);
                var url = context.scheduler().path;
                requestify.post(url + '/clients/setConfig', {userId: accessToken.userId, config: config.vars});
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
