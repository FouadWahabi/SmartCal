var loopback = require('loopback');

var notFounfError = new Error();
notFounfError.status = 404;
notFounfError.message = 'Task not found';
notFounfError.code = 'NOT_FOUND';

module.exports = function(Task) {
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
                cb(notFounfError, {});
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
    Task.insertTask = function(label, cb) {
        var ctx = loopback.getCurrentContext();
        // Get the current access token
        var accessToken = ctx.get('accessToken');
        Task.create({label: label, ownerId : accessToken.userId}, cb);
    }
    Task.remoteMethod('insertTask', {
      accepts: [
        {arg: 'label', type: 'string'},
      ],
      returns: { type: 'string', root: true },
      http: {path:'/insertTask', verb: 'post'}
    });

    // update task
    Task.updateTask = function(id, label, cb) {
        var ctx = loopback.getCurrentContext();
        // Get the current access token
        var accessToken = ctx.get('accessToken');
        Task.findById(id, function(err, task) {
            if(task != null && task.ownerId == accessToken.userId) {
                task.label = label;
                task.save();
                cb(null, task);
            } else {
                cb(notFounfError, {});
            }
        });
    }
    Task.remoteMethod('updateTask', {
      accepts: [
        {arg: 'id', type: 'string'},
        {arg: 'label', type:'string'}
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

                cb(notFounfError, {});
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
};
