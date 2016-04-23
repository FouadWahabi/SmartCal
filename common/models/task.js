var loopback = require('loopback');
var Validator = require('schema-validator');
var helpers = require('../helpers.js');
var app = require('../../server/server');

module.exports = function(Task) {
  // hinding all remote methods
  helpers.disableAllMethods(Task);

  // get tasks
  Task.getTasks = function(cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    Task.find({"where": {"ownerId": accessToken.userId} }, cb);
  }
  Task.remoteMethod('getTasks', {
    returns: { type: 'array', root: true },
    http: {path:'/getTasks', verb: 'get'}
  });

  // get task
  Task.getTask = function(id, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    Task.findById(id, function(err, task) {
      if(task != null && task.ownerId == accessToken.userId) {
        cb(null, task);
      } else {
        cb(helpers.TASK_NOT_FOUND, {});
      }
    });
  }
  Task.remoteMethod('getTask', {
    accepts: [
      {arg: 'id', type: 'string'},
    ],
    returns: { type: 'string', root: true },
    http: {path:'/getTask', verb: 'get'}
  });

  // insert task
  Task.insertTask = function(task, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    // retrieve current task schema
    app.models.Context.findOne({where: {ownerId: accessToken.userId}, include: ['scheduler']}, function(err, context) {
      if(context != null) {
        if(context.scheduler() != null) {
          app.models.taskschema.findOne({where: {id: context.scheduler().taskschemaId}}, function(err, taskschema) {
            if(taskschema != null) {
              var validator = new Validator(taskschema.schema);
              var check = validator.check(task);
              if(!check._error) {
                Task.create({ownerId: accessToken.userId, schemaId: taskschema.id, vars: task}, cb);
              } else {
                cb(helpers.TASK_INSERTION_FAILED, {});
              }
            } else {
              cb(helpers.TASK_SCHEMA_NOT_FOUND, {});
            }
          });
        } else {
          cb(helpers.SCHEDULER_NOT_FOUND, {});
        }
      } else {
        cb(helpers.CONTEXT_NOT_FOUND, {});
      }
    });
  }
  Task.remoteMethod('insertTask', {
    accepts: [
      { arg: 'task', type: 'object', http: { source: 'body' } },
    ],
    returns: { type: 'string', root: true },
    http: {path:'/insertTask', verb: 'post'}
  });

  // update task
  Task.updateTask = function(id, vars, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    Task.findOne({id: id}, function(err, task) {
      if(task != null && task.ownerId == accessToken.userId) {
        app.models.Context.findOne({where: {ownerId: accessToken.userId}, include: ['scheduler']}, function(err, context) {
          if(context != null) {
            app.models.taskschema.findOne({where: {id: context.scheduler().taskschemaId}}, function(err, taskschema) {
              if(taskschema != null) {
                var validator = new Validator(taskschema.schema);
                var check = validator.check(vars);
                if(!check._error) {
                  task.vars = vars;
                  task.save();
                  cb(null, task);
                } else {
                  cb(helpers.TASK_INSERTION_FAILED, {});
                }
              } else {
                cb(helpers.TASK_SCHEMA_NOT_FOUND, {});
              }
            });
          } else {
            cb(helpers.CONTEXT_NOT_FOUND, {})
          }
        });
      } else {
        cb(helpers.TASK_NOT_FOUND, {});
      }
    });
  }
  Task.remoteMethod('updateTask', {
    accepts: [
      {arg: 'id', type: 'string'},
      {arg: 'vars', type: 'object', http: { source: 'body' }}
    ],
    returns : { type: 'string', root: true},
    http: {path: '/updateTask', verb: 'post'}
  });

  // delete task
  Task.deleteTask = function(id, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    Task.findById(id, function(err, task) {
      if(task != null && task.ownerId == accessToken.userId) {
        task.delete();
        cb(null, {});
      } else {
        cb(helpers.TASK_NOT_FOUND, {});
      }
    });
  }
  Task.remoteMethod('deleteTask', {
    accepts: [
      {arg: 'id', type: 'string'},
    ],
    returns: { type: 'string', root: true },
    http: {path:'/deleteTask', verb: 'get'}
  });

  // start task
  Task.startTask = function(id, state, vars, cb) {
    Task.getTask(id, function(err, task) {
      if(task != null) {
        app.models.State.insertState(state, function(err, state) {
          if(state != null) {
            app.models.action.create({taskId: task.id, startStateId: state.id, endStateId: null, vars: vars}, cb);
          } else {
            cb(helpers.STATE_INSERTION_FAILED, {});
          }
        });
      } else {
        cb(helpers.TASK_NOT_FOUND, {});
      }
    });
  }
  Task.remoteMethod('startTask', {
    accepts: [
      { arg: 'id', type: 'string' },
      { arg: 'state', type: 'object', http: {source: 'body'} },
      { arg: 'vars', type: 'object', http: { source: 'body' } }
    ],
    returns: { type: 'string', root: true },
    http: {path:'/startTask', verb: 'post'}
  });

  // end task
  Task.endTask = function(id, state, cb) {
    app.models.action.findOne({where: {taskId: id}}, function(err, action) {
      if(!err && action.endStateId === null) {
        app.models.State.insertState(state, function(err, state) {
          if(state != null) {
            action.endStateId = state.id;
            action.save();
            cb(null, action);
          } else {
            cb(helpers.STATE_INSERTION_FAILED, {});
          }
        })
      } else {
        cb(helpers.ACTION_NOT_FOUND, {})
      }
    })
  }
  Task.remoteMethod('endTask', {
    accepts: [
      { arg: 'id', type: 'string' },
      { arg: 'state', type: 'object', http: {source: 'body'} }
    ],
    returns: { type: 'string', root: true },
    http: {path:'/endTask', verb: 'post'}
  });
};
