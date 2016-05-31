var uuid = require('uuid');
var http = require('http');


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

/************************************************************
函数名:errorLog(db,errorMsg,response)
参数及释义：
db							操作的数据库对象
errorMsg
response					用于返回get请求的对象体
函数作用：
	记录错误日志
作者：徐思源
时间：20151013
************************************************************/
function errorLog(db,errorMsg,response){
	db.collection("errorLog", function(err, collection){
		if(err){
			console.log("error:"+err);
			alertMsg(response,'error',err,'0');
			}else{
				var errorMsg = {errorMsg:errorMsg};
				collection.insert(errorMsg,function(err,data){
					if(err){
						console.log("error:"+err);
						alertMsg(response,'error',err,'0');
						}else{
							alertMsg(response,'info','errorMsg logged',data);
							}
					});
				}
	});		
}

exports.writeResponse = writeResponse;
exports.errorLog = errorLog;
