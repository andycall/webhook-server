var http = require('http');
var createHandler = require('./Webhock_handle');
var handler = createHandler({ path : "/webhook" , 'secret' : "c7e41fd7aa6903fc0d2cd560a49b43084d23e32f"});
var exec = require("child_process").exec;
var fs = require("fs");
var stdout = process.stdout;
var stdin = process.stdin;
var path = require('path');
var test =  require('tape');
var dirlog = "./log/";

process.on('uncaughtException', function(err){
	setTimeout(startServer, 5000);
});

function getTime(){
	var date = new date();
	return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
}

function log(msg){
	var time = getTime();
	fs.appendFileSync(dirlog + time + ".log", msg);
}

function createLogDir(){
	if(!fs.existsSync(dirlog) || fs.statSync(dirlog).isDirectory()) {
		fs.mkdirSync(dirlog);
	}
}

function startServer(){
	http.createServer(function(req, res){
		handler(req, res, function(err){
			res.statusCode = 404;
			res.end("ERROR");
		});
		createLogDir();
	}).listen(7890);

	handler.on('error', function(msg){
		console.log("ERROR: ", msg);
	});

	handler.on('push', function(event){
		console.log('receive an push event for %s to %s', event.payload.repository.name, event.payload.ref);
		log("---------- " + getTime() + ' ' + event.payload.repository.name + ' ------------\n');
		
	});

	handler.on('issue', function(event){
		console.log('Received an issue event for % action=%s: #%d %s',
			event.payload.repository.name,
			event.payload.action,
			event.payload.issue.number,
			event.payload.issue.title);
	});
}
startServer();


