var packageVersion = require('./../package.json').version;
console.log("packageVersion :: " + packageVersion);

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

var helpers = require('../common/helpers.js');

// ------------ Protecting mobile backend with Mobile Client Access start -----------------

// Load passport (http://passportjs.org)
var passport = require('passport');

// Get the MCA passport strategy to use
// var MCABackendStrategy = require('bms-mca-token-validation-strategy').MCABackendStrategy;

// Tell passport to use the MCA strategy
// passport.use(new MCABackendStrategy())

// Tell application to use passport
app.use(passport.initialize());

// Protect service with mobile client access
// app.get('/**', passport.authenticate('mca-backend-strategy', {session: false}));
// app.post('/**', passport.authenticate('mca-backend-strategy', {session: false}));
// app.put('/**', passport.authenticate('mca-backend-strategy', {session: false}));
// app.delete('/**', passport.authenticate('mca-backend-strategy', {session: false}));

// Protect /protected endpoint which is used in Getting Started with Bluemix Mobile Services tutorials
// app.get('/protected', passport.authenticate('mca-backend-strategy', {session: false}), function(req, res){
// 	res.send("Hello, this is a protected resouce of the mobile backend application!");
// });
// ------------ Protecting backend APIs with Mobile Client Access end -----------------

app.start = function () {
	// start the web server
	return app.listen(function () {
		app.emit('started');
		var baseUrl = app.get('url').replace(/\/$/, '');
		console.log('Web server listening at: %s', baseUrl);
		var componentExplorer = app.get('loopback-component-explorer');
		if (componentExplorer) {
			console.log('Browse your REST API at %s%s', baseUrl, componentExplorer.mountPath);
		}

		// create admin user
		app.models.User.findOrCreate({where:{email: 'admin@admin.com'}},{email: 'admin@admin.com', password: 'admin'}, function(err, admin) {
	    //create the admin role
	    app.models.Role.create({
	      name: 'admin'
	    }, function(err, role) {
	      //make admin an admin
	      role.principals.create({
	        principalType: app.models.RoleMapping.USER,
	        principalId: admin.id
	      }, function(err, principal) {
	      });
	    });
	  });

		// setup dijkstra matrix
		app.models.Adapter.getAdapters(function(err, adapters) {
			var adapter_adj = {}
			for(var i = 0; i < adapters.length; i++) {
				var src = {};
				if(adapters[i].schemaFromId in adapter_adj)
					src = adapter_adj[adapters[i].schemaFromId];
				else
					adapter_adj[adapters[i].schemaFromId] = src;
				var old = src[adapters[i].schemaToId];
				if(old===undefined || old.loss>adapters[i].loss ||
					(old.loss==adapters[i].loss && old.complexity>adapters[i].complexity))
					src[adapters[i].schemaToId] = adapters[i];
				if(!(adapters[i].schemaToId in adapter_adj))
					adapter_adj[adapters[i].schemaToId] = {};
			}
			for (var vertex in adapter_adj){
				helpers.adapter_graph.addVertex(vertex, adapter_adj[vertex]);
			}
			helpers.adapter_dijkstra = helpers.adapter_graph.compile();
			console.log('I just finished')
			for(var vertex in helpers.adapter_dijkstra) {
				console.log(vertex, helpers.adapter_dijkstra[vertex]);
			}
		});
	});
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
	if (err) throw err;
	if (require.main === module)
	app.start();
});
