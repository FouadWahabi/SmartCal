var helpers = require('../helpers.js');
var app = require('../../server/server');

// agent = user interface
module.exports = function(Agent) {
  // hinding all remote methods
  helpers.disableAllMethods(Agent);

  Agent.getAgents = function(cb) {
    Agent.find(cb);
  }

  Agent.remoteMethod('getAgents', {
    returns: { type: 'string', root: true },
    http: {path:'/getAgents', verb: 'get'}
  });

  // insert agent
  Agent.insertAgent = function(scheduleschemaId, schedulerlayoutschemaId, scheduleparamschemaId, cb) {
    Agent.create({schedulerlayoutschemaId: schedulerlayoutschemaId, scheduleschemaId: scheduleschemaId, scheduleparamschemaId: scheduleparamschemaId}, cb);
  }

  Agent.remoteMethod('insertAgent', {
    accepts: [
      {arg: 'scheduleschemaId', type: 'string'},
      {arg: 'schedulerlayoutschemaId', type: 'string'},
      {arg: 'scheduleparamschemaId', type: 'string'},
    ],
    returns: { type: 'string', root: true },
    http: {path:'/insertAgent', verb: 'post'}
  });

};
