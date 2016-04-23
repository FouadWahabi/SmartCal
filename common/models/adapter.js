var helpers = require('../helpers.js');
var app = require('../../server/server');

module.exports = function(Adapter) {
  // hinding all remote methods
  helpers.disableAllMethods(Adapter);

  Adapter.insertAdpater = function(func, schemaFromId, schemaToId, loss, complexity, cb) {
    Adapter.create({func: func, schemaFromId : schemaFromId, schemaToId : schemaToId, loss: loss, complexity: complexity}, function(err, adapter) {
      helpers.adapter_graph.addEdge(adapter.schemaFromId, adapter.schemaToId, adapter);
      helpers.adapter_dijkstra = helpers.adapter_graph.compile();
      console.log('I just finished after insertion')
      for(var vertex in helpers.adapter_dijkstra) {
        console.log(vertex, helpers.adapter_dijkstra[vertex]);
      }
      cb(err, adapter);
    });
  }

  Adapter.remoteMethod('insertAdpater', {
    accepts: [
      {arg: 'func', type: 'string'},
      {arg: 'schemaFromId', type: 'string'},
      {arg: 'schemaToId', type: 'string'},
      {arg: 'loss', type: 'number'},
      {arg: 'complexity', type: 'number'}
    ],
    returns: { type: 'string', root: true },
    http: {path:'/insertAdpater', verb: 'post'}
  });

  Adapter.getAdapters = function(cb) {
    Adapter.find(cb);
  }

  Adapter.remoteMethod('getAdapters', {
    returns: { type: 'string', root: true },
    http: {path:'/getAdapters', verb: 'get'}
  });

  Adapter.getAdapter = function(id, cb) {
    Adapter.findById(id, function(err, adapter) {
      if(adapter != null) {
        cb(null, adapter);
      } else {
        cb(helpers.ADAPTER_NOT_FOUND, {});
      }
    })
  }

  Adapter.remoteMethod('getAdapter', {
    accepts: [
      {arg: 'id', type: 'string'}
    ],
    returns: { type: 'string', root: true },
    http: {path:'/getAdapter', verb: 'get'}
  });

  Adapter.adaptObject = function(object, schemaToId, cb) {
    var path = [];
    while(schemaToId != object.schemaId) {
      var lastadapter = helpers.adapter_dijkstra[object.schemaId][schemaToId];
      path.push(lastadapter);
      if(lastadapter === null) {
        cb(helpers.CANNOT_ADAPT, {});
      }
      schemaToId = lastadapter.schemaFromId;
    }
    var adapter;
    while((adapter = path.pop()) !== undefined) {
      if(adapter.func) {
        object.schemaId = adapter.schemaToId;
        if(!helpers.adapter_cache[adapter.id]) {
          helpers.adapter_cache[adapter.id] = new Function(['object'], adapter.func)
        }
        object.vars = (helpers.adapter_cache[adapter.id])(object.vars);
      } else {
        cb(helpers.FUNCTION_NOT_FOUND, {});
      }
    }
    cb(null, object);
  }

  Adapter.adaptTask = function(taskId, schemaToId, cb) {
    app.models.Task.getTask(taskId, function(err, task) {
      Adapter.adaptObject(task, schemaToId, cb);
    })
  }

  Adapter.remoteMethod('adaptTask', {
    accepts: [
      {arg: 'taskId', type: 'string'},
      {arg: 'schemaToId', type: 'string'}
    ],
    returns: { type: 'string', root: true },
    http: {path:'/adaptTask', verb: 'post'}
  });

};
