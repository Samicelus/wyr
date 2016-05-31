var uuid = require('uuid');
var http = require('http');
var https = require('https');
var httpRet = require('./httpRet')
var crypto = require('crypto');
var str_tmp ="";
var serverIP = "119.29.92.190";
var fs = require('fs');
var uuid = require('uuid');

/************************************************************
函数名:addCourse(db,openid,courseType,preciseType,courseName,address1,address2,price,courseLength,totalCourse,trail,studentPerClass,response)
参数及释义：
db							操作的数据库对象
openid
courseType
preciseType
courseName
address1
address2
price
courseLength
totalCourse
trail
studentPerClass
response					用于返回get请求的对象体
函数作用：
    添加教学，添加前先查看state为1或2的教学是否超过数量10个
作者：徐思源
时间：20160112
************************************************************/
function addCourse(db,openid,courseType,preciseType,courseName,address1,address2,price,courseLength,totalCourse,trail,studentPerClass,response){
	db.collection("course", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,$or:[{state:1},{state:2}]};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length > 5){
								console.log("教学过多(超过5个)请删除已过期教学");
								httpRet.alertMsg(response,'error',"教学过多(超过5个)请删除已过期教学",'0');
								}else{
									var xid = uuid.v4();
									var course = {_id:xid,openid:openid,courseName:courseName,courseType:courseType,preciseType:preciseType,address1:address1,address2:address2,price:price,courseLength:courseLength,totalCourse:totalCourse,trail:trail,studentPerClass:studentPerClass,state:1,inuse:1};
									collection.insert(course,function(err,data){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');
											}else{
												console.log("教学添加成功");
												httpRet.alertMsg(response,'success',"教学添加成功",data);
												}
										});
									}
							}
					});
				}
		});	
	}

/************************************************************
函数名:delectCourse(db,openid,id,response)
参数及释义：
db							操作的数据库对象
openid
id
response					用于返回get请求的对象体
函数作用：
    删除教学，即将该教学的state置为0
作者：徐思源
时间：20160112
************************************************************/
function delectCourse(db,openid,id,response){
	db.collection("course", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {_id:id,openid:openid,$or:[{state:1},{state:2}],inuse:1};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("您帐户下没有对应教学或该教学已失效");
								httpRet.alertMsg(response,'error',"您帐户下没有对应教学或该教学已失效",'0');
								}else{
									var mod = {$set:{inuse:0}};
									collection.update(condition,mod,function(err,data){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');
											}else{
												console.log("教学删除成功");
												httpRet.alertMsg(response,'success',"教学删除成功",data);
												}
										});
									}
							}
					});
				}
		});		
	}

/************************************************************
函数名:modCourseAddress(db,openid,CourseId,address1,address2,response)
参数及释义：
db							操作的数据库对象
openid
CourseId
address1
address2
response					用于返回get请求的对象体
函数作用：
    修改教学地址
作者：徐思源
时间：20160112
************************************************************/
function modCourseAddress(db,openid,CourseId,address1,address2,response){
	db.collection("course", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,_id:CourseId};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("未找到对应教学");
								httpRet.alertMsg(response,'error',"未找到对应教学",'0');
								}else{
									var mod = {$set:{address1:address1,address2:address2,state:1}}
									collection.update(condition,mod,function(err,data){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');
											}else{
												console.log("教学地址修改成功");
												httpRet.alertMsg(response,'success',"教学地址修改成功",data);
												}
										});
									}
							}
					});
				}
		});	
	}
	
	
/************************************************************
函数名:getMyCourse(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    获取我的所有state为1或2教学
作者：徐思源
时间：20160112
************************************************************/
function getMyCourse(db,openid,response){
	db.collection("course", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,$or:[{state:1},{state:2}],inuse:1};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到对应教学");
								httpRet.alertMsg(response,'error',"没有找到对应教学",'0');
								}else{
									console.log("查询成功");
									httpRet.alertMsg(response,'success',"查询成功",bars);
									}
							}
					});
				}
		});		
	}

/************************************************************
函数名:getWaitCourse(db,response)
参数及释义：
db							操作的数据库对象
response					用于返回get请求的对象体
函数作用：
    获取所有state为1的教学
作者：徐思源
时间：20160112
************************************************************/
function getWaitCourse(db,response){
	db.collection("course", function(err, collection){
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
							if(bars.length == 0){
								console.log("没有找到对应教学");
								httpRet.alertMsg(response,'error',"没有找到对应教学",'0');
								}else{
									console.log("查询成功");
									httpRet.alertMsg(response,'success',"查询成功",bars);
									}
							}
					});
				}
		});		
	}

/************************************************************
函数名:authCourse(db,courseId,authState,response)
参数及释义：
db							操作的数据库对象
response					用于返回get请求的对象体
函数作用：
    修改对应id的state为1的教学,将其state置为authState
作者：徐思源
时间：20160112
************************************************************/
function authCourse(db,courseId,authState,response){
	db.collection("course", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {_id:courseId,state:1};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到对应教学id或该教学不在待审核状态");
								httpRet.alertMsg(response,'error',"没有找到对应教学id或该教学不在待审核状态",'0');
								}else{
									var mod = {$set:{state:authState}};
									collection.update(condition,mod,function(err,data){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');	
											}else{
												httpRet.alertMsg(response,'success',"审核成功",data);
												}
										});
									}
							}
					});
				}
		});		
	}

/************************************************************
函数名:findCourseByType(db,preciseType,courseName,response)
参数及释义：
db							操作的数据库对象
preciseType
courseName
response					用于返回get请求的对象体
函数作用：
    查询所有名称中含关键词courseName并且类型为preciseType的教学
时间：20160112
************************************************************/	
function findCourseByType(db,preciseType,courseName,response){
	db.collection("course", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {courseName:{$regex:courseName},preciseType:preciseType,state:2};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到符合条件的教学");
								httpRet.alertMsg(response,'error',"没有找到符合条件的教学",'0');
								}else{
									console.log("查询成功");
									httpRet.alertMsg(response,'success',"查询成功",bars);
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:findInterestCourse(db,courseName,response)
参数及释义：
db							操作的数据库对象
courseName					关键词数组
response					用于返回get请求的对象体
函数作用：
    查询所有名称中含关键词courseName的教学
时间：20160112
************************************************************/	
function findInterestCourse(db,courseName,response){
	db.collection("course", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var courseRegStr = "";
				for(var i=0;i<courseName.length;i++){
					if(i == 0){
						courseRegStr = courseName[i];
						}else{
							courseRegStr += "|"+courseName[i];
							}
					}
				var courseReg = new RegExp(courseRegStr);
				var condition = {courseName:{$regex:courseReg},state:2};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到符合条件的教学");
								httpRet.alertMsg(response,'error',"没有找到符合条件的教学",'0');
								}else{
									console.log("查询成功");
									httpRet.alertMsg(response,'success',"查询成功",bars);
									}
							}
					});
				}
		});
	}
	
/****************课程相关*******************/
exports.addCourse = addCourse;
exports.delectCourse = delectCourse;
exports.modCourseAddress = modCourseAddress;
exports.getMyCourse = getMyCourse;
exports.getWaitCourse = getWaitCourse;
exports.authCourse = authCourse;
exports.findCourseByType =findCourseByType;
exports.findInterestCourse = findInterestCourse;

