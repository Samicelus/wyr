var uuid = require('uuid');
var http = require('http');
var https = require('https');
var crypto = require('crypto');
var str_tmp ="";
var serverIP = "119.29.92.190";
var fs = require('fs');


/************************************************************
函数名：writeResponse(response,content)
参数及释义：
response					用于返回get请求的对象体
content						返回的内容文本
函数作用：
    用于其他函数响应返回get请求，设置header为
"Access-Control-Allow-Origin":"*"以解决跨域问题。
作者：徐思源
时间：20150722
************************************************************/	
function writeResponse(response,content){
	response.writeHead(200,{"Content-Type":"text/plain; charset=utf-8","Access-Control-Allow-Origin":"*","Cache-Control":"no-cache, no-store, must-revalidate","Pragma":"no-cache","Expires":"0"});
	response.write(content);
	response.end();
	}

/************************************************************
函数名：alertMsg(,result,msg,data)
参数及释义：
db							操作的数据库对象
response					用于返回get请求的对象体
函数作用：
   
作者：徐思源
时间：20151013
************************************************************/
function alertMsg(response,result,msg,data){
	console.log(msg);
	var ret = JSON.stringify({result:result,msg:msg,data:data});
	writeResponse(response,ret); 	
}


exports.writeResponse = writeResponse;
exports.alertMsg = alertMsg;

