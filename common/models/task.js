var loopback = require('loopback');
var Validator = require('jsonschema').Validator;
var helpers = require('../helpers.js');
var app = require('../../server/server');
var requestify = require('requestify');

module.exports = function(Task) {
  // hinding all remote methods
  helpers.disableAllMethods(Task);

  // get tasks
  // TODO : adapt filter
  Task.getTasks = function(param, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    if(param === undefined) {
      param = {};
    }
    var filter = param.filter;
    var userId = null;
    if(filter === undefined) {
      filter = {};
    }
    if(filter.where === undefined) {
      filter.where = {};
    }
    if(accessToken != null) {
      userId = accessToken.userId;
    } else {
      userId = param.userId;
    }
    app.models.context.findOne({'where': {'ownerId': userId}}, function(err, context) {
      if(!err && context != null) {
        if(accessToken == null && context.schedulerPass !== param.schedulerPass) {
          cb(helpers.NOT_AUTHORIZED, {});
          return;
        }
        filter.where.ownerId = userId;
        Task.find(filter, function(err, tasks) {
          if(!err && tasks != null) {
            app.models.scheduler.findById(context.schedulerId, function(err, scheduler) {
              if(!err && scheduler != null) {
                tasks = tasks.map(function(task) {
                  var taskAdapted;
                  app.models.Adapter.adaptObject(task, scheduler.taskschemaId, function(err, task) {
                    taskAdapted = task;
                  })
                  return taskAdapted;
                });
                cb(null, tasks);
              } else {
                cb(helpers.SCHEDULER_NOT_FOUND, {});
              }
            });
          } else {
            cb(helpers.INTERNAL_ERROR, {});
          }
        });
      } else {
        cb(helpers.CONTEXT_NOT_FOUND, {});
      }
    });
  }

  Task.remoteMethod('getTasks', {
    accepts: [
      {arg: 'param', type: 'object'}
    ],
    returns: { type: 'array', root: true },
    http: {path:'/getTasks', verb: 'post'}
  });

  // insert task
  Task.insertTask = function(taskVars, cb) {
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    // retrieve current task schema
    app.models.Context.findOne({where: {ownerId: accessToken.userId}, include: ['scheduler']}, function(err, context) {
      if(context != null) {
        if(context.scheduler() != null) {
          app.models.schema.findOne({where: {id: context.scheduler().taskschemaId}}, function(err, taskschema) {
            if(taskschema != null) {
              var validator = new Validator();
              var check = validator.validate(taskVars, taskschema.schema);
              console.log(check)
              if(check.errors.length === 0) {
                Task.create({ownerId: accessToken.userId, schemaId: taskschema.id, vars: taskVars}, function(err, task){
                  if(!err && task !== null) {
                  //  requestify.post(context.scheduler().path, {method: 'insertTask', param: {task: task, userId: accessToken.userId}});
                  }
                  cb(err, task);
                });
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
                var validator = new Validator();
                var check = validator.validate(vars, taskschema.schema);
                if(check.errors.length === 0) {
                  task.vars = vars;
                  task.schemaId = taskschema.id;
                  task.save();
                  cb(null, task);
                //  requestify.post(context.scheduler().path, {method: 'updateTask', param: {task: task, userId: accessToken.userId}});
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
      //  requestify.post(context.scheduler().path, {method: 'deleteTask', param: {task: task, userId: accessToken.userId}});
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
            app.models.action.create({taskId: task.id, startStateId: state.id, endStateId: null, vars: vars}, function(err, action) {
              if(!err && action != null) {
              //  requestify.post(context.scheduler().path, {method: 'startTask', param: {action: action, state: state, userId: accessToken.userId}});
                cb(null, action);
              } else {
                cb(err, {});
              }
            });
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
          //  requestify.post(context.scheduler().path, {method: 'endTask', param: {action: action, userId: accessToken.userId}});
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
