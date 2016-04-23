module.exports.disableAllMethods = function disableAllMethods(model, methodsToExpose)
{
  if(model && model.sharedClass)
  {
    methodsToExpose = methodsToExpose || [];

    var modelName = model.sharedClass.name;
    var methods = model.sharedClass.methods();
    var relationMethods = [];
    var hiddenMethods = [];

    try
    {
      Object.keys(model.definition.settings.relations).forEach(function(relation)
      {
        relationMethods.push({ name: '__findById__' + relation, isStatic: false });
        relationMethods.push({ name: '__destroyById__' + relation, isStatic: false });
        relationMethods.push({ name: '__updateById__' + relation, isStatic: false });
        relationMethods.push({ name: '__exists__' + relation, isStatic: false });
        relationMethods.push({ name: '__link__' + relation, isStatic: false });
        relationMethods.push({ name: '__get__' + relation, isStatic: false });
        relationMethods.push({ name: '__create__' + relation, isStatic: false });
        relationMethods.push({ name: '__update__' + relation, isStatic: false });
        relationMethods.push({ name: '__destroy__' + relation, isStatic: false });
        relationMethods.push({ name: '__unlink__' + relation, isStatic: false });
        relationMethods.push({ name: '__count__' + relation, isStatic: false });
        relationMethods.push({ name: '__delete__' + relation, isStatic: false });
      });
    } catch(err) {}

    methods.concat(relationMethods).forEach(function(method)
    {
      var methodName = method.name;
      if(methodsToExpose.indexOf(methodName) < 0)
      {
        hiddenMethods.push(methodName);
        model.disableRemoteMethod(methodName, method.isStatic);
      }
    });

    if(hiddenMethods.length > 0)
    {
      console.log('\nRemote mehtods hidden for', modelName, ':', hiddenMethods.join(', '), '\n');
    }
  }
};

function PriorityQueue () {
  this._nodes = [];

  this.enqueue = function (priority, key) {
    this._nodes.push({key: key, priority: priority });
    this.sort();
  }
  this.dequeue = function () {
    return this._nodes.shift().key;
  }
  this.sort = function () {
    this._nodes.sort(function (a, b) {
      return a.priority - b.priority;
    });
  }
  this.isEmpty = function () {
    return !this._nodes.length;
  }
}

/**
* Pathfinding starts here
*/
function Graph(){
  var INFINITY = 1/0;
  var infinity = {loss: INFINITY, complexity: INFINITY};
  this.vertices = {};

  this.addVertex = function(name, edges){
    this.vertices[name] = edges;
  }

  this.addEdge = function(u, v, adapter){
    if(this.vertices[u] === undefined) {
      this.vertices[name] = {};
    }
    if(
      this.vertices[u][v] === undefined ||
      this.vertices[u][v].loss > adapter.loss ||
      (this.vertices[u][v].loss === adapter.loss && this.vertices[u][v].complexity > adapter.complexity)
    ) {
      this.vertices[u][v] = adapter;
    }
  }

  this.compile = function () {
    var matrix = {};
    for(var vertex in this.vertices) {
      matrix[vertex]=this.fromSource(vertex);
    }
    return matrix;
  }
  this.fromSource = function (start) {
    var nodes = new PriorityQueue(),
    distances = {},
    previous = {},
    smallest, vertex, neighbor, alt;

    for(vertex in this.vertices) {
      if(vertex === start) {
        distances[vertex] = {loss:0, complexity:0};
        nodes.enqueue(0, vertex);
      }
      else {
        distances[vertex] = infinity;
        nodes.enqueue(infinity, vertex);
      }

      previous[vertex] = null;
    }

    while(!nodes.isEmpty()) {
      smallest = nodes.dequeue();

      if(!smallest || (distances[smallest].loss === infinity.loss && distances[smallest].complexity === infinity.complexity)){
        continue;
      }

      for(neighbor in this.vertices[smallest]) {
        var alt = {}
        alt.loss = distances[smallest].loss + this.vertices[smallest][neighbor].loss;
        alt.complexity = distances[smallest].complexity + this.vertices[smallest][neighbor].complexity;
        if(alt.loss < distances[neighbor].loss ||
          (alt.loss === distances[neighbor].loss && alt.complexity < distances[neighbor].complexity) ) {
            distances[neighbor] = alt;
            previous[neighbor] = this.vertices[smallest][neighbor];

            nodes.enqueue(alt, neighbor);
          }
        }
      }

      return previous;
    }
  }

  // ==== Cosntants =====
  module.exports.TASK_NOT_FOUND = {status: 404, message : 'Task not found', code: 'NOT_FOUND'};
  module.exports.CONTEXT_NOT_FOUND = {status: 404, message : 'Context not found', code: 'NOT_FOUND'};
  module.exports.USER_NOT_FOUND = {status: 404, message : 'User not found', code: 'NOT_FOUND'};
  module.exports.STATE_NOT_FOUND = {status: 404, message : 'State not found', code: 'NOT_FOUND'};
  module.exports.TASK_SCHEMA_NOT_FOUND = {status: 404, message : 'TaskSchema not found', code: 'NOT_FOUND'};
  module.exports.CONFIG_NOT_FOUND = {status: 404, message : 'State not found', code: 'NOT_FOUND'};
  module.exports.CONFIG_SCHEMA_NOT_FOUND = {status: 404, message : 'TaskSchema not found', code: 'NOT_FOUND'};
  module.exports.STATE_SCHEMA_NOT_FOUND = {status: 404, message : 'StateSchema not found', code: 'NOT_FOUND'};
  module.exports.SCHEDULER_NOT_FOUND = {status: 404, message : 'Scheduler not found', code: 'NOT_FOUND'};
  module.exports.ACTION_NOT_FOUND = {status: 404, message : 'Action not found', code: 'NOT_FOUND'};
  module.exports.ADAPTER_NOT_FOUND = {status: 404, message : 'Adpater not found', code: 'NOT_FOUND'};
  module.exports.USER_CREATION_FAILED = {status: 400, message : 'User creation failed', code: 'BAD_REQUEST'};
  module.exports.TASK_INSERTION_FAILED = {status: 400, message : 'Task insertion failed', code: 'BAD_REQUEST'};
  module.exports.TASK_UPDATE_FAILED = {status: 400, message : 'Task update failed', code: 'BAD_REQUEST'};
  module.exports.STATE_INSERTION_FAILED = {status: 400, message : 'State insertion failed', code: 'BAD_REQUEST'};
  module.exports.ADAPTER_INSERTION_FAILED = {status: 400, message : 'Adapter insertion failed', code: 'BAD_REQUEST'};
  module.exports.CANNOT_ADAPT = {status: 400, message : 'Object adapt failed', code: 'BAD_REQUEST'}
  // ================ chache ======
  module.exports.adapter_cache = {}
  module.exports.adapter_dijkstra = {}
  module.exports.adapter_graph = new Graph()
