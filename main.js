var http = require('http');
var createHandler = require('./hander');
var handler = createHandler({ path : "/webhook" , 'secret' : "c7e41fd7aa6903fc0d2cd560a49b43084d23e32f"});
var exec = require("child_process").exec;
var fs = require("fs");
var stdout = process.stdout;
var stdin = process.stdin;
var path = require('path');
var dirlog = __dirname + "/log/";

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
	if(!fs.existsSync(path) || !fs.statSync(path).isDirectory()) {
		fs.mkdirSync(path);
	}
}

function startServer(){
	http.createServer(function(req, res){
		handler(req, res, function(err){
			res.statusCode = 404;
			res.end("ERROR");
		});
		console.log("server Listening on PORT 7890");
	}).listen(7890);

	handler.on('error', function(msg){
		errorLog(msg);
	});

	handler.on('push', function(event){
		console.log('receive an push event for %s to %s', event.payload.repository.name, event.payload.ref);
		var payload = event.payload;
		var branch =  payload.ref.split("/")[2];
		var origin =  payload.repository.git_url;
		exec("cd " + __dirname + " && git pull " + origin + " " + branch, function(error, stdout, stderr){
			var time = getTime();
			var total_str = ["---------- " + time +" ------------\n"+
					"There are the push events :"];
			var commits_str = [];
			payload.commits.forEach(function(value){
				var committer_str = [];
				committer_str.push("push_time     " + value.timestamp);
				committer_str.push("id       :" + value.id);
				committer_str.push("message  :" + value.message);
				committer_str.push("url      :" + value.url);
				committer_str.push("username :" + value.committer.username);
				committer_str.push("email    :" + value.committer.email + "\n");
				commits_str.push(committer_str.join("\n"));
			});
			total_str.push(commits_str.join("--------------------------\n"));
			total_str.push(stdout);
			total_str.push("---------- END ------------\n");

			if(error){
				return errorLog(msg);	
			}
			log(total_str.join('\n'));
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

