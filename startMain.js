/**
 * New node file
 */
var child_process = require("child_process");

function spawn(mainModule){
	var child = child_process.spawn('node', [mainModule]); 
	
	child.stdout.on('data', function (data) {
		console.log('' + data);
	});
	child.stderr.on('data', function (data) {
		console.log('==>>The child_process stderr: ' + data); 
	});
	
	child.on('close', function (code) {
		console.log('==>>child process exited with code ' + code);
	});
	
	child.on('exit', function (code) {
		spawn(mainModule);
	});
} 
			
spawn('index.js');