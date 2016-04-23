var helpers = require('../helpers.js');

module.exports = function(taskschema) {
  // hinding all remote methods
  helpers.disableAllMethods(taskschema);

  // get task schema
  taskschema.getTaskSchema = function(id, cb) {
    taskschema.findById(id, function(err, taskschema) {
      if(taskschema != null) {
        cb(null, taskschema);
      } else {
        cb(helpers.TASK_SCHEMA_NOT_FOUND, {});
      }
    });
  }

  taskschema.remoteMethod('getTaskSchema', {
    accepts: [
      {arg: 'id', type: 'string'},
    ],
    returns: { type: 'string', root: true },
    http: {path:'/getTaskSchema', verb: 'get'}
  });

  // set scheduler TaskSchema
  taskschema.insertTaskSchema = function(schema, cb) {
    app.models.taskschema.create({schema: schema}, cb);
  }

  taskschema.remoteMethod('insertTaskSchema', {
    accepts: [
      {arg: 'schema', type: 'object'}
    ],
    returns: { type: 'string', root: true },
    http: {path:'/insertTaskSchema', verb: 'post'}
  });

};
