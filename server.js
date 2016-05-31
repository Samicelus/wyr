var http = require('http');
var url = require('url');
var net = require('net');

function start(route, handler) {
	http.createServer(function(request, response) {
        var pathname = url.parse(request.url).pathname;
        // 路由到相应的业务逻辑
        route (pathname, handler, response, request);
    }).listen(5901);
	console.log('server is starting at 5901');

	}
	

exports.start = start;
