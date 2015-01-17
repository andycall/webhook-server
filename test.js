var http = require('http');
var createHandler = require('./Webhock_handle');
var handler = createHandler({ path : "/webhook" , 'secret' : "c7e41fd7aa6903fc0d2cd560a49b43084d23e32f"});
var exec = require("child_process").exec;
var fs = require("fs");
var stdout = process.stdout;
var stdin = process.stdin;
var path = require('path');
var test =  require('tape');
var dirlog = __dirname + "/log/";

process.on('uncaughtException', function(err){
	setTimeout(startServer, 5000);
});

function getTime(){
	var date = new Date();
	return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
}

function log(msg){
	var time = getTime();
	createLogDir(dirlog);
	fs.appendFileSync(dirlog + time + ".log", msg);
}

function errorLog(msg){
	var time = getTime();
	createLogDir(dirlog + 'error/');
	fs.appendFileSync(dirlog + "error/" + time + '.log', msg);
}

function createLogDir(path){
	if(!fs.existsSync(path) || fs.statSync(path).isDirectory()) {
		fs.mkdirSync(path);
	}
}

function startServer(){
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
		var payload = event.payload;
		var branch =  payload.ref.split("/")[2];
		var origin =  payload.repository.git_url;

		exec("cd " + __dirname + " && git pull " + origin + " " + branch, function(error, stdout, stderr){
			var time = getTime();
			if(error != null){
				errorLog(stderr);
			}
			else{
				log("---------- " + time +" ------------\n"+
					"Receive an push event from : \n" +
					"push_time     :" + payload.commits.timestamp + "\n" +
					"id       :" + payload.commits.id + "\n"+
					"message  :" + payload.commits.message + "\n"+
					"url      :" + payload.commits.url  + "\n" +
					"username :" + payload.commits.committer.username + "\n" +
					"email    :" + payload.commits.committer.email + "\n" +
				"---------- END ------------\n");
			}
		});
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

