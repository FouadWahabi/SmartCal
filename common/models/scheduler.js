var helpers = require('../helpers.js');
var app = require('../../server/server');

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
  Scheduler.insertScheduler = function(schedulerName, schedulerPath,taskschemaId,stateschemaId,configschemaId, cb) {
    Scheduler.create({name: schedulerName, path: schedulerPath, taskschemaId: taskschemaId, statechemaId: stateschemaId, configschemaId: configschemaId}, cb);
  }

  Scheduler.remoteMethod('insertScheduler', {
    accepts: [
      {arg: 'name', type: 'string'},
      {arg: 'path', type: 'string'},
      {arg: 'taskschemaId', type: 'string'},
      {arg: 'stateschemaId', type: 'string'},
      {arg: 'configschemaId', type: 'string'},
    ],
    returns: { type: 'string', root: true },
    http: {path:'/insertScheduler', verb: 'post'}
  });

};
