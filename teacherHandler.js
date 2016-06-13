var uuid = require('uuid');
var http = require('http');
var https = require('https');
var httpRet = require('./httpRet');
var jwtHandler = require('./jwtHandler');
var crypto = require('crypto');
var str_tmp ="";
var serverIP = "119.29.92.190";
var fs = require('fs');
var messageHandler = require('./messageHandler');



/************************************************************
函数名:addTeacher(db,openid,phoneNum,authCode,response)
参数及释义：
db							操作的数据库对象
openid						用户openid
phoneNum					手机号
authCode					验证码
response					用于返回get请求的对象体
函数作用：
    注册用户
作者：徐思源
时间：20151230
************************************************************/
function addTeacher(db,openid,phoneNum,authCode,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				//查询用户是否已经注册为老师
				var condition = {openid:openid,userType:"teacher"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length != 0){
								//用户已注册成为老师
								console.log("已经注册成为老师,无法重复注册");
								httpRet.alertMsg(response,'error',"已经注册成为老师,无法重复注册",'0');	
								}else{
									//用户不存在,验证手机
									db.collection("checkPhone", function(err, collection){
											if(err){
												console.log("error:"+err);
												httpRet.alertMsg(response,'error',err,'0');
												}else{
													var condition ={phoneNum:phoneNum};
													var affichage ={phoneNum:1,code:1};
													collection.find(condition,affichage).toArray(function(error,bars){
														if(error){
															console.log("error: "+error);
															httpRet.alertMsg(response,'error',err,'0');
															}else{
																var verified = 0;
																for(var i in bars){
																	if(bars[i].code == authCode){
																		verified = 1;
																		}
																	}
																if(verified == 1){
																	//验证通过
																	db.collection("user", function(err, collection){
																		if(err){
																			console.log("error:"+err);
																			httpRet.alertMsg(response,'error',err,'0');
																			}else{
																				var xid = uuid.v4();
																				//注册为老师,state=0为未审核通过
																				var userData = {_id:xid,openid:openid,phoneNum:phoneNum,userType:"teacher",maxVideo:0,state:0};
																				collection.insert(userData, function(err, data){
																					if (data){
																						httpRet.alertMsg(response,'success','user add success',openid); 
																						} else {
																							httpRet.alertMsg(response,'error',err,'0'); 
																							}																
																					});	
																				}
																		});
																	}else{
																		console.log("手机验证码错误");
																		httpRet.alertMsg(response,'error','手机验证码错误','0'); 							
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
函数名:modTeacherProfile(db,openid,userName,desShort,desLong,homeAddressId,response)
参数及释义：
db							操作的数据库对象
openid
userName
desShort
desLong
homeAddressId
response					用于返回get请求的对象体
函数作用：
    更新教师资料
作者：徐思源
时间：20151230
************************************************************/
function modTeacherProfile(db,openid,userName,desShort,desLong,homeAddressId,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,userType:"teacher"};
				var mod = {$set:{userName:userName,desShort:desShort,desLong:desLong,homeAddressId:homeAddressId,state:0}};
				collection.update(condition,mod,function(err,data){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							console.log("修改成功");
							httpRet.alertMsg(response,'success',"修改成功,您的资料将通知管理员审核,在此期间您将可能无法正常使用部分功能",data);
							}
					});
				}
		});
	}

/************************************************************
函数名:getTeacherByName(db,userName,response)
参数及释义：
db							操作的数据库对象
userName
response					用于返回get请求的对象体
函数作用：
    查询用户
作者：徐思源
时间：20151230
************************************************************/
function getTeacherByName(db,userName,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {userName:{$regex:userName},userType:"teacher"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到该姓名的教师");
								httpRet.alertMsg(response,'error',"没有找到该姓名的教师",'0');
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
函数名:getTeacherByPhone(db,phoneNum,response)
参数及释义：
db							操作的数据库对象
phoneNum
response					用于返回get请求的对象体
函数作用：
    查询用户
作者：徐思源
时间：20151230
************************************************************/
function getTeacherByPhone(db,phoneNum,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {phoneNum:phoneNum,userType:"teacher"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到该电话注册的教师");
								httpRet.alertMsg(response,'error',"没有找到该电话注册的教师",'0');
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
函数名:getTeacherInfo(db,response)
参数及释义：
db							操作的数据库对象
response					用于返回get请求的对象体
函数作用：
    查询所有待审核的老师
作者：徐思源
时间：20151230
************************************************************/
function getTeacherInfo(db,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {state:0,userType:"teacher"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有待审核的教师");
								httpRet.alertMsg(response,'error',"没有待审核的教师",'0');
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
函数名:modTeacherState(db,id,auth,response)
参数及释义：
db							操作的数据库对象
id							老师id
auth						认证结果
response					用于返回get请求的对象体
函数作用：
    实名认证教师
作者：徐思源
时间：20151230
************************************************************/
function modTeacherState(db,id,auth,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:id,userType:"teacher"};
				if((auth == 0)||(auth == 1)){
				var mod = {$set:{state:auth}};
				console.log(mod);
					collection.update(condition,mod,function(err,data){
						if(err){
							console.log("error:"+err);
							httpRet.alertMsg(response,'error',err,'0');						
							}else{
								//console.log(data);
								//console.log("教师实名认证结束");
								httpRet.alertMsg(response,'success',"教师实名认证结束",auth);
								//这里应该向教师发送实名认证结果通知
								messageHandler.sendTeacherAuthResult(db,id,auth);
								}
						});					
					}else{
						console.log("auth 参数错误");
						httpRet.alertMsg(response,'error','auth 参数错误','0');
						}
				}
		});
	}

/************************************************************
函数名:loginTeacher(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    老师登录
作者：徐思源
时间：20151230
************************************************************/
function loginTeacher(db,openid,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,userType:"teacher"};
				collection.find(condition,{openid:0}).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("登录失败,尚未注册为老师");
								httpRet.alertMsg(response,'error',"登录失败,尚未注册为老师",'0');
								}else{
									console.log("老师登录成功");
									var retData = bars[0];
									retData.jwt = jwtHandler.generatejwt({openid:openid,userType:"teacher"});
									httpRet.alertMsg(response,'success',"老师登录成功",retData);
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:findUserByOpenid(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    根据openid查找用户
作者：徐思源
时间：20151230
************************************************************/
function findUserByOpenid(db,openid,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {state:{$ne:0},openid:openid,"userType":"teacher"};
				//var condition = {openid:openid};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到该openid的可用注册用户");
								httpRet.alertMsg(response,'error',"没有找到该openid的可用注册用户",'0');
								}else{
									console.log("查询成功teacher:"+JSON.stringify(bars));
									httpRet.alertMsg(response,'success',"查询成功",bars);
									}
							}
					});
				}
		});
	}



	
/****************老师相关*******************/
exports.addTeacher = addTeacher;//
exports.modTeacherProfile = modTeacherProfile;//
exports.getTeacherByName = getTeacherByName;//
exports.getTeacherByPhone = getTeacherByPhone;//
exports.getTeacherInfo = getTeacherInfo;
exports.modTeacherState = modTeacherState;//
exports.loginTeacher = loginTeacher;

exports.findUserByOpenid = findUserByOpenid;