var helpers = require('../helpers.js');
var app = require('../../server/server');
var Validator = require('jsonschema').Validator;

module.exports = function(Scheduler) {
  // hinding all remote methods
  helpers.disableAllMethods(Scheduler);

  Scheduler.getSchedulers = function(cb) {
    Scheduler.find(cb);
  }

  Scheduler.remoteMethod('getSchedulers', {
    returns: { type: 'string', root: true },
    http: {path:'/getSchedulers', verb: 'get'}
  });

  // insert scheduler
  Scheduler.insertScheduler = function(schedulerName, schedulerPath, schedulerLayout, defaultconfig, taskschemaId, stateschemaId, configschemaId, scheduleschemaId, schedulerlayoutschemaId, scheduleparamschemaId, cb) {
    app.models.schema.findOne({where: {id: schedulerlayoutschemaId}}, function(err, layoutschema) {
      if(layoutschema != null) {
        var validator = new Validator();
        var check = validator.validate(schedulerLayout, layoutschema.schema);
        if(check.errors.length === 0) {
          app.models.schema.findOne({where: {id: configschemaId}}, function(err, configschema) {
            if(!err && configschema!= null) {
              check = validator.validate(defaultconfig, configschema.schema);
              if(check.errors.length === 0) {
                Scheduler.create({name: schedulerName, path: schedulerPath, layout: {vars: schedulerLayout,
                  schemaId: schedulerlayoutschemaId}, defaultconfig: {vars: defaultconfig,
                    schemaId: configschemaId} ,taskschemaId: taskschemaId,
                    statechemaId: stateschemaId, configschemaId: configschemaId,
                    scheduleschemaId: scheduleschemaId, scheduleparamschemaId: scheduleparamschemaId}, cb);
                  } else {
                    cb(helpers.SCHEDULER_INSERTION_FAILED, {});
                  }
                } else {
                  cb(helpers.SCHEMA_NOT_FOUND, {});
                }
              });
            } else {
              cb(helpers.SCHEDULER_INSERTION_FAILED, {});
            }
          } else {
            cb(helpers.LAYOUT_SCHEMA_NOT_FOUND, {});
          }
        });
      }

      Scheduler.remoteMethod('insertScheduler', {
        accepts: [
          {arg: 'name', type: 'string', required: true},
          {arg: 'path', type: 'string', required: true},
          {arg: 'layout', type: 'object', required: true},
          {arg: 'defaultconfig', type: 'object', required: true},
          {arg: 'taskschemaId', type: 'string', required: true},
          {arg: 'stateschemaId', type: 'string', required: true},
          {arg: 'configschemaId', type: 'string', required: true},
          {arg: 'scheduleschemaId', type: 'string', required: true},
          {arg: 'schedulerlayoutschemaId', type: 'string', required: true},
          {arg: 'scheduleparamschemaId', type: 'string', required: true},
        ],
        returns: { type: 'string', root: true },
        http: {path:'/insertScheduler', verb: 'post'}
      });

    };
