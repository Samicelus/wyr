var uuid = require('uuid');
var http = require('http');
var https = require('https');
var serverIP = "119.29.92.190";
var serverPort = 6001;
var fs = require('fs');
var querystring = require("querystring");
var post = require('./post');
var httpRet = require('./httpRet');
var messageHandler = require('./messageHandler');

/************************************************************
函数名:addCourseType(db,typeName,imgUrl,response)
参数及释义：
db							操作的数据库对象
typeName					课程类型名称
imgUrl						图片url
response					用于返回get请求的对象体
函数作用：
    增添课程类型
作者：徐思源
时间：20160112
************************************************************/
function addCourseType(db,typeName,imgUrl,response){
	db.collection("courseType", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {typeName:typeName,state:1};
				collection.count(condition,function(err,data){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(data != 0){
								console.log("该课程名称已存在");
								httpRet.alertMsg(response,'error',"该课程名称已存在",'0');	
								}else{
									//添加课程类型
									var xid = uuid.v4();
									var courseType = {_id:xid,typeName:typeName,url:imgUrl,state:1};
									collection.insert(courseType,function(err,data){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');
											}else{
												console.log("课程类型添加成功");
												httpRet.alertMsg(response,'success',"课程类型添加成功",data);
												}
										});
									}
							}
					});
				}
		});		
	}
	
/************************************************************
函数名:delectCourseType(db,id,response)
参数及释义：
db							操作的数据库对象
id							课程类型的id
response					用于返回get请求的对象体
函数作用：
    增添课程类型
作者：徐思源
时间：20160112
************************************************************/
function delectCourseType(db,id,response){
	db.collection("courseType", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {_id:id};
				var mod = {$set:{state:0}};
				collection.update(condition,mod,function(err,data){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							console.log("课程类型删除成功");
							httpRet.alertMsg(response,'success','课程类型删除成功',data);
							}
					});
				}
		});		
	}

/************************************************************
函数名:getAllCourseType(db,response)
参数及释义：
db							操作的数据库对象
id							课程类型的id
response					用于返回get请求的对象体
函数作用：
    增添课程类型
作者：徐思源
时间：20160112
************************************************************/
function getAllCourseType(db,response){
	db.collection("courseType", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {state:1};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							console.log("课程类型获取成功");
							httpRet.alertMsg(response,'success','课程类型获取成功',bars);
							}
					});
				}
		});		
	}

	
exports.addCourseType = addCourseType;
exports.delectCourseType = delectCourseType;
exports.getAllCourseType =getAllCourseType;