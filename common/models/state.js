var helpers = require('../helpers.js');
var app = require('../../server/server');
var Validator = require('jsonschema').Validator;
var loopback = require('loopback');
var requestify = require('requestify');

module.exports = function(State) {
  // hinding all remote methods
  helpers.disableAllMethods(State);

  // insert state
  State.insertState = function(state, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    // retrieve current state schema
    app.models.Context.findOne({where: {ownerId: accessToken.userId}, include: ['scheduler']}, function(err, context) {
      if(context != null) {
        app.models.schema.findOne({where: {id: context.scheduler().statechemaId}}, function(err, stateschema) {
          if(stateschema != null) {
            var validator = new Validator();
            var check = validator.validate(state, stateschema.schema);
            if(check.errors.length === 0) {
              State.create({ownerId: accessToken.userId, schemaId: stateschema.id, vars: state}, function(err, state) {
                app.models.User.setCurrentState(state.id, cb);
                var url = context.scheduler().path;
                requestify.post(url + '/clients/setState', {state: state.vars, userId: accessToken.userId});
              });
            } else {
              cb(helpers.STATE_INSERTION_FAILED, {});
            }
          } else {
            cb(helpers.STATE_SCHEMA_NOT_FOUND, {});
          }
        });
      } else {
        cb(helpers.CONTEXT_NOT_FOUND, {});
      }
    });
  }

  State.remoteMethod('insertState', {
    accepts: [
      { arg: 'state', type: 'object', http: { source: 'body' } },
    ],
    returns: { type: 'string', root: true },
    http: {path:'/insertState', verb: 'post'}
  });

};
