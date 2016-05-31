var uuid = require('uuid');
var http = require('http');
var https = require('https');
var httpRet = require('./httpRet')
var crypto = require('crypto');
var str_tmp ="";
var serverIP = "119.29.92.190";
var fs = require('fs');

/************************************************************
函数名:addVideo(db,videoid,openid,title,response)
参数及释义：
db							操作的数据库对象
videoid						youku的视频id
openid						用户id
title						视频标题
response					用于返回get请求的对象体
函数作用：
    添加视频
作者：徐思源
时间：20150810
************************************************************/
function addVideo(db,videoid,openid,title,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				//查询用户最大上传数
				var condition = {openid:openid};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("user not exist.");
								httpRet.alertMsg(response,'error',"user not exist.",'0'); 
								}else{
									var maxVideo = 0;
									if(typeof(bars[0].maxVideo)!="undefined"){
										maxVideo = Number(bars[0].maxVideo);
										}else{
											maxVideo = 0;
											}
									//查询该用户的视频数
									db.collection("video", function(err, collection){
											if(err){
												console.log("error:"+err);
												httpRet.alertMsg(response,'error',err,'0');
												}else{
													var condition ={openid:openid};
													collection.find(condition).toArray(function(error,bars){
														if(error){
															console.log("error: "+error);
															httpRet.alertMsg(response,'error',err,'0');
															}else{
																if(bars.length >= maxVideo){
																	console.log("超过最大上传视频数: "+maxVideo);
																	httpRet.alertMsg(response,'error',"超过最大上传视频数: "+maxVideo,'0');																	
																	}else{
																		var xid = uuid.v4();
																		console.log(xid);
																		var video = {
																			_id:xid,
																			openid:openid,
																			videoid:videoid,
																			title:title
																			};
																		collection.insert(video,function(err,data){
																			if(err){
																				console.log("error: "+error);
																				httpRet.alertMsg(response,'error',err,'0');
																				}else{
																					httpRet.alertMsg(response,'success','video saved',video);
																					}
																			});
																		}
																}
														});
													}
											});										
									}
							}
					});
				}
	});
}

/************************************************************
函数名:getMyVideo(db,openid,response)
参数及释义：
db							操作的数据库对象
openid						用户openid
response					用于返回get请求的对象体
函数作用：
    查询用户的Video
作者：徐思源
时间：20150810
************************************************************/
function getMyVideo(db,openid,response){
	db.collection("video", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				//
				var condition = {openid:openid};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("该用户还没上传视频");
								httpRet.alertMsg(response,'error','该用户还没上传视频','0');
								}else{
									httpRet.alertMsg(response,'success','视频已获取',bars);
									}
							}
					});
				}
	});
}


/****************优酷视频相关*******************/
exports.addVideo = addVideo;
exports.getMyVideo = getMyVideo;

