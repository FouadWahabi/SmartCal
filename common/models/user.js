var helpers = require('../helpers.js');
var app = require('../../server/server');
var loopback = require('loopback');
var crypto = require('crypto');
var requestify = require('requestify');
var uuid = require('node-uuid');

module.exports = function(User) {
  // hinding all remote methods
  helpers.disableAllMethods(User);

  // signup method
  User.signup = function(user, cb) {
    User.create(user, function(err, user) {
      if(!err) {
        var Context = app.models.Context;

        Context.create({ownerId: user.id, schedulerId: null, schedulerPass: null, stateId: null, configId: null}, function(err, context) {
          if(context != null) {
            user.contextId = context.id;
            user.save();
            cb(null, user);
          } else {
            cb(helpers.USER_CREATION_FAILED, {});
          }
        });
      } else  {
        cb(helpers.USER_CREATION_FAILED, {});
      }
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
            var url = scheduler.path;
            // generate uuid
            var schedulerPass = uuid.v4();
            context.updateAttributes({schedulerId: schedulerId, schedulerPass: schedulerPass}, cb);
            // send to scheduler
            console.log("register client")
            requestify.post(scheduler.path + '/clients/registerClient', {schedulerPass: schedulerPass, userId: accessToken.userId});
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
    app.models.config.findById(configId, function(err, config) {
      if(config != null) {
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

  User.getSchedule = function(agentId, hash, scheduleparam, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    app.models.context.findOne({where: {ownerId: accessToken.userId}}, function(err, context) {
      if(!err && context != null) {
        shasum = crypto.createHash('sha1');
        shasum.update(context.configId+context.schedulerId);
        var response = {};
        var newhash = shasum.digest('hex');
        app.models.agent.findById(agentId, function(err, agent) {
          if(!err && agent != null) {
            app.models.scheduler.findById(context.schedulerId, function(err, scheduler) {
              if(!err && scheduler != null) {
                var getSchedule = function() {
                  var url = scheduler.path;
                  requestify.post(url + '/clients/getSchedule', {userId: accessToken.userId, scheduleparam: scheduleparam}).then(function (res) {
                    var schedule = res.getBody();
                    response.schedule = schedule;
                    cb(null, response);
                  });
                  // TODO repair adaption
                  //scheduleparam.schemaId = agent.scheduleparamschemaId;
                  // app.models.Adapter.adaptObject(scheduleparam, scheduler.scheduleparamschemaId, function(err, scheduleparam) {
                  //   if(!err && scheduleparam != null) {
                  //     requestifyl.post(url + '/clients/getSchedule', scheduleparam).then(function (res) {
                  //       var schedule = JSON.parse(res.getBody());
                  //       schedule.schemaId = scheduler.scheduleschemaId;
                  //       app.models.Adapter.adaptObject(schedule, agent.scheduleschemaId, function(err, schedule) {
                  //         if(!err && schedule != null) {
                  //           response.schedule = schedule;
                  //           cb(null, response);
                  //         } else {
                  //           cb(helpers.CANNOT_ADAPT, {});
                  //         }
                  //       });
                  //     }).catch(function(err) {
                  //       cb(helpers.SCHEDULER_NOT_RESPONDING, {});
                  //     });
                  //   } else {
                  //     cb(helpers.CANNOT_ADAPT, {});
                  //   }
                  // });
                };
                if(newhash != hash) {
                  response.hash = newhash;
                  app.models.config.findById(context.configId, function(err, config) {
                    if(!err && config != null) {
                      response.config = config;
                      // TODO repair adaption
                      getSchedule();
                      // adapt
                      // app.models.Adapter.adaptObject(scheduler.layout, agent.schedulerlayoutschemaId, function(err, layout) {
                      //   if(!err && layout != null) {
                      //     response.schedulerLayout = layout;
                      //     // contact the scheduler to get schedule
                      //     getSchedule();
                      //   } else {
                      //     cb(helpers.CANNOT_ADAPT, {});
                      //   }
                      // });
                    } else {
                      cb(helpers.CONFIG_NOT_FOUND, {});
                    }
                  });
                } else {
                  // contact the scheduler to get schedule
                  getSchedule();
                }
              } else {
                cb(helpers.SCHEDULER_NOT_FOUND, {});
              }
            });
          } else {
            cb(helpers.AGENT_NOT_FOUND, {});
          }
        });
      } else {
        cb(helpers.CONTEXT_NOT_FOUND, {});
      }
    });
  }

  User.remoteMethod('getSchedule', {
    accepts: [
      {arg: 'agentId', type: 'string'},
      {arg: 'hash', type: 'string'},
      {arg: 'scheduleparam', type: 'object'}
    ],
    returns: {type: 'string', root: true},
    http: {path:'/getSchedule', verb: 'post'}
  })

};
