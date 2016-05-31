var querystring = require('querystring'),
    fs = require('fs'),
    formidable = require('formidable');

var url = require('url');
var gm = require('gm').subClass({imageMagick: true});	


function start (response,request) {
    console.log('start module');
	fs.readFile('./html/newStyleUpLoad.html', function (err, data) {
		if (err){
			console.log(err);
			response.write("err"+err);
			response.end();
		}else{
			var body = data;
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(body);
			response.end();			
			}
	});
}

function resizePage (response,request) {
    console.log('resize page module');
	fs.readFile('./html/uploadResize.html', function (err, data) {
		if (err){
			console.log(err);
			response.write("err"+err);
			response.end();
		}else{
			var body = data;
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(body);
			response.end();			
			}
	});
}

function upload (response, request) {
    console.log('upload module');
    var form = new formidable.IncomingForm();
	form.uploadDir='tmp';
	console.log("about to parse");
    form.parse(request, function (error, fields, files){
		console.log("parsing done");
		//用户的openid
		var openid = fields.openid;
		console.log("openid:"+openid);
		//用户帐户类型
		var userType = fields.userType;
		console.log("userType:"+userType);
		//图片类型
		var imageType = fields.imageType;
		console.log("imageType:"+imageType);
		//图片编号
		var imageCode = fields.imageCode;
		console.log("imageCode:"+imageCode);		
		//创建保存文件的文件夹
		var savePath = 'D:/express/www/public/userImages/'+openid+'/'+userType+'/'+imageType+'/';
		var url = 'http:/www.wanyirart.cc/userImages/'+openid+'/'+userType+'/'+imageType+'/'+imageCode+'.jpg';
		var urlPreview = 'http:/www.wanyirart.cc/userImages/'+openid+'/'+userType+'/'+imageType+'/'+imageCode+'_small.jpg';
		fs.mkdir('D:/express/www/public/userImages/'+openid+'/',function(err,data){
			fs.mkdir('D:/express/www/public/userImages/'+openid+'/'+userType+'/',function(err,data){
				fs.mkdir(savePath,function(err,data){
					fs.renameSync(files.upload.path, savePath+imageCode+'.jpg');
					//制作缩略图
					gm(savePath+imageCode+'.jpg').resize(100, 100, '!').noProfile().write(savePath+imageCode+'_small.jpg',function(err){
						if(err){
							console.log(err);
							}else{
								//返回给页面的消息
								var ret = JSON.stringify({result:"success",msg:"image uploaded",data:{url:url,urlPreview:urlPreview}});
								response.writeHead(200, {"Content-Type":"text/plain; charset=utf-8","Access-Control-Allow-Origin":"*","Cache-Control":"no-cache, no-store, must-revalidate","Pragma":"no-cache","Expires":"0"});
								response.write(ret);
								response.end();
								}
						});
					});						
				});	
			});
		});
	}


function uploadResize (response, request) {
    console.log('uploadResize module');
    var form = new formidable.IncomingForm();
	form.uploadDir='tmp';
	console.log("about to parse");
    form.parse(request, function (error, fields, files){
		console.log("parsing done");
		//用户的openid
		var openid = fields.openid;
		console.log("openid:"+openid);
		//用户帐户类型
		var userType = fields.userType;
		console.log("userType:"+userType);
		//图片类型
		var imageType = fields.imageType;
		console.log("imageType:"+imageType);
		//图片编号
		var imageCode = fields.imageCode;
		console.log("imageCode:"+imageCode);
		//图片裁切信息
		var width = fields.width;
		console.log("width:"+width);
		var height = fields.height;
		console.log("height:"+height);
		var x = fields.x;
		console.log("x:"+x);
		var y = fields.y;
		console.log("y:"+y);
		//图片缩放信息
		var xResize = fields.xResize;
		console.log("xResize:"+xResize);
		var yResize = fields.yResize;
		console.log("yResize:"+yResize);
		
		//创建保存文件的文件夹
		var savePath = 'D:/express/www/public/userImages/'+openid+'/'+userType+'/'+imageType+'/';
		var url = 'http:/www.wanyirart.cc/userImages/'+openid+'/'+userType+'/'+imageType+'/'+imageCode+'.jpg';
		var urlPreview = 'http:/www.wanyirart.cc/userImages/'+openid+'/'+userType+'/'+imageType+'/'+imageCode+'_small.jpg';
		fs.mkdir('D:/express/www/public/userImages/'+openid+'/',function(err,data){
			fs.mkdir('D:/express/www/public/userImages/'+openid+'/'+userType+'/',function(err,data){
				fs.mkdir(savePath,function(err,data){
					fs.renameSync(files.upload.path, savePath+imageCode+'.jpg');
					//制作缩略图
					gm(savePath+imageCode+'.jpg').crop(width,height,x,y).resize(xResize, yResize, '!').noProfile().write(savePath+imageCode+'_reSized.jpg',function(err){
						if(err){
							console.log(err);
							}else{
								//返回给页面的消息
								var ret = JSON.stringify({result:"success",msg:"image uploaded",data:{url:url,urlPreview:urlPreview}});
								response.writeHead(200, {"Content-Type":"text/plain; charset=utf-8","Access-Control-Allow-Origin":"*","Cache-Control":"no-cache, no-store, must-revalidate","Pragma":"no-cache","Expires":"0"});
								response.write(ret);
								response.end();
								}
						});
					});						
				});	
			});
		});
	}	
	
//去掉后缀
function delExtension(str){
	var reg = /\.\w+$/;
	return str.replace(reg,'');
	}



exports.start = start;
exports.resizePage = resizePage;
exports.upload = upload;
exports.uploadResize = uploadResize;