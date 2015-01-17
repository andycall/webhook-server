var http = require('http');
var createHandler = require('./Webhock_handle');
var handler = createHandler({ path : "/webhook" , 'secret' : "c7e41fd7aa6903fc0d2cd560a49b43084d23e32f"});

http.createServer(function(req, res){
	handler(req, res, function(err){
		res.statusCode = 404;
		res.end("ERROR");
	});
}).listen(7890);



handler.on('error', function(msg){
	console.log("ERROR: ", msg);
});

handler.on('push', function(event){
	console.log('receive an push event for %s to %s', event.payload.repository.name, event.payload.ref);
});

handler.on('issue', function(event){
	console.log('Received an issue event for % action=%s: #%d %s',
		event.payload.repository.name,
		event.payload.action,
		event.payload.issue.number,
		event.payload.issue.title)
});







