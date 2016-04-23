var helpers = require('../helpers.js');
var app = require('../../server/server');
var loopback = require('loopback');

module.exports = function(User) {
  // hinding all remote methods
  helpers.disableAllMethods(User);

  // signup method
  User.signup = function(user, cb) {
    User.create(user, function(err, user) {
      var Context = app.models.Context;

      Context.create({ownerId: user.id, schedulerId: null, stateId: null, configId: null}, function(err, context) {
        if(context != null) {
          user.contextId = context.id;
          user.save();
          cb(null, user);
        } else {
          cb(helpers.USER_CREATION_FAILED, {});
        }
      });
    });
  }

  User.remoteMethod('signup', {
    accepts: [
      { arg: 'user', type: 'object', http: { source: 'body' } },
    ],
    returns: { type: 'string', root: true },
    http: {path:'/signup', verb: 'post'}
  });

  // signin method
  User.signin = function(user, cb) {
    User.login(user, cb);
  }

  User.remoteMethod('signin', {
    accepts: [
      { arg: 'user', type: 'object', http: { source: 'body' } },
    ],
    returns: { type: 'string', root: true },
    http: {path:'/signin', verb: 'post'}
  });

  // signout method
  User.signout = function(cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');

    User.logout(accessToken.id, cb);
  }

  User.remoteMethod('signout', {
    http: {path:'/signout', verb: 'get'}
  });

  // set Scheduler
  User.setScheduler = function(schedulerId, cb) {
    var ctx = loopback.getCurrentContext();
    app.models.scheduler.findById(schedulerId, function(err, scheduler) {
      if(scheduler != null) {
        // Get the current access token
        var accessToken = ctx.get('accessToken');
        app.models.context.findOne({where: {ownerId: accessToken.userId}}, function(err, context) {
          if(context != null) {
            if(context.ownerId === accessToken.userId) {
              context.updateAttributes({schedulerId: schedulerId}, cb);
            } else {
              context.create({ownerId: accessToken.userId, schedulerId: schedulerId, stateId: null}, cb);
            }
          } else {
            cb(helpers.CONTEXT_NOT_FOUND, {});
          }
        });
      } else {
        cb(helpers.SCHEDULER_NOT_FOUND, {});
      }
    });
  }

  User.remoteMethod('setScheduler', {
    accepts: [
      {arg: 'schedulerId', type: 'string'},
    ],
    returns: {type: 'string', root: true},
    http: {path:'/setScheduler', verb: 'post'}
  })

  // get Scheduler
  User.getScheduler = function(cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    app.models.context.findOne({where: {ownerId: accessToken.userId}}, function(err, context) {
      if(context != null) {
        app.models.scheduler.findById(context.schedulerId, function(err, scheduler) {
          if(scheduler != null) {
            cb(null, scheduler);
          } else {
            cb(helpers.SCHEDULER_NOT_FOUND, {});
          }
        });
      } else {
        cb(helpers.CONTEXT_NOT_FOUND);
      }
    });
  }

  User.remoteMethod('getScheduler', {
    returns: {type: 'string', root: true},
    http: {path:'/getScheduler', verb: 'get'}
  })

  // get current state
  User.getCurrentState = function(cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    app.models.context.findOne({where: {ownerId: accessToken.userId}}, function(err, context) {
      if(context != null) {
        app.models.state.findById(context.stateId, function(err, state) {
          if(state != null) {
            cb(null, state);
          } else {
            cb(helpers.STATE_NOT_FOUND, {});
          }
        });
      } else {
        cb(helpers.CONTEXT_NOT_FOUND);
      }
    });
  }

  User.remoteMethod('getCurrentState', {
    returns: {type: 'string', root: true},
    http: {path:'/getCurrentState', verb: 'get'}
  })

  // set CurrentState
  User.setCurrentState = function(stateId, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    app.models.state.findById(stateId, function(err, state) {
      if(state != null) {
        // Get the current access token
        var accessToken = ctx.get('accessToken');
        app.models.context.findOne({where: {ownerId: accessToken.userId}}, function(err, context) {
          if(context != null) {
            if(context.ownerId === accessToken.userId) {
              context.updateAttributes({stateId: stateId}, cb);
            } else {
              context.create({ownerId: accessToken.userId, schedulerId: null, stateId: stateId}, cb);
            }
          } else {
            cb(helpers.CONTEXT_NOT_FOUND, {});
          }
        });
      } else {
        cb(helpers.STATE_NOT_FOUND, {});
      }
    });
  }

  User.remoteMethod('setCurrentState', {
    accepts: [
      {arg: 'stateId', type: 'string'},
    ],
    returns: {type: 'string', root: true},
    http: {path:'/setCurrentState', verb: 'post'}
  })

  // set CurrentConfig
  User.setCurrentConfig = function(configId, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    app.models.config.findById(stateId, function(err, config) {
      if(state != null) {
        // Get the current access token
        var accessToken = ctx.get('accessToken');
        app.models.context.findOne({where: {ownerId: accessToken.userId}}, function(err, context) {
          if(context != null) {
            if(context.ownerId === accessToken.userId) {
              context.updateAttributes({configId: configId}, cb);
            } else {
              context.create({ownerId: accessToken.userId, schedulerId: null, configId: configId, stateId: null}, cb);
            }
          } else {
            cb(helpers.CONTEXT_NOT_FOUND, {});
          }
        });
      } else {
        cb(helpers.CONFIG_NOT_FOUND, {});
      }
    });
  }

  User.remoteMethod('setCurrentConfig', {
    accepts: [
      {arg: 'configId', type: 'string'},
    ],
    returns: {type: 'string', root: true},
    http: {path:'/setCurrentConfig', verb: 'post'}
  })

  // get current config
  User.getCurrentConfig = function(cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    app.models.context.findOne({where: {ownerId: accessToken.userId}}, function(err, context) {
      if(context != null) {
        app.models.config.findById(context.configId, function(err, config) {
          if(config != null) {
            cb(null, config);
          } else {
            cb(helpers.CONFIG_NOT_FOUND, {});
          }
        });
      } else {
        cb(helpers.CONTEXT_NOT_FOUND);
      }
    });
  }

  User.remoteMethod('getCurrentConfig', {
    returns: {type: 'string', root: true},
    http: {path:'/getCurrentConfig', verb: 'get'}
  })

};
