var uuid = require('uuid');
var http = require('http');
var https = require('https');
var httpRet = require('./httpRet');
var jwtHandler = require('./jwtHandler');
var crypto = require('crypto');
var str_tmp ="";
var serverIP = "119.29.92.190";
var fs = require('fs');




/************************************************************
函数名:addStudent(db,openid,phoneNum,authCode,response)
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
function addStudent(db,openid,phoneNum,authCode,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				//查询用户是否已经注册为student
				var condition = {openid:openid,userType:"student"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length != 0){
								//用户已注册成为老师
								console.log("已经注册成为学生,无法重复注册");
								httpRet.alertMsg(response,'error',"已经注册成为学生,无法重复注册",'0');	
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
																				//注册为student,state=0为未审核通过
																				var userData = {_id:xid,openid:openid,phoneNum:phoneNum,userType:"student",maxVideo:0,state:1};
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
函数名:modStudentProfile(db,openid,userName,desLong,response)
参数及释义：
db							操作的数据库对象
openid
userName
desLong
response					用于返回get请求的对象体
函数作用：
    更新student资料
作者：徐思源
时间：20151230
************************************************************/
function modStudentProfile(db,openid,userName,desLong,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,userType:"student"};
				var mod = {$set:{userName:userName,desLong:desLong,state:1}};
				collection.update(condition,mod,function(err,data){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							console.log("修改成功");
							httpRet.alertMsg(response,'success',"修改成功",data);						
							}
					});
				}
		});
	}

/************************************************************
函数名:getStudentByName(db,userName,response)
参数及释义：
db							操作的数据库对象
userName
response					用于返回get请求的对象体
函数作用：
    查询用户
作者：徐思源
时间：20151230
************************************************************/
function getStudentByName(db,userName,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {userName:{$regex:userName},userType:"student"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到该姓名的学生");
								httpRet.alertMsg(response,'error',"没有找到该姓名的学生",'0');
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
函数名:getStudentByPhone(db,phoneNum,response)
参数及释义：
db							操作的数据库对象
phoneNum
response					用于返回get请求的对象体
函数作用：
    查询用户
作者：徐思源
时间：20151230
************************************************************/
function getStudentByPhone(db,phoneNum,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {phoneNum:phoneNum,userType:"student"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到该电话注册的学生");
								httpRet.alertMsg(response,'error',"没有找到该电话注册的学生",'0');
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
函数名:getStudentInfo(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    查询用户
作者：徐思源
时间：20151230
************************************************************/
function getStudentInfo(db,openid,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,userType:"student"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到该openid的学生");
								httpRet.alertMsg(response,'error',"没有找到该openid的学生",'0');
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
函数名:loginStudent(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    老师登录
作者：徐思源
时间：20151230
************************************************************/
function loginStudent(db,openid,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,userType:"student"};
				collection.find(condition,{openid:0}).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("登录失败,尚未注册为学生");
								httpRet.alertMsg(response,'error',"登录失败,尚未注册为学生",'0');
								}else{
									console.log("学生登录成功");
									var retData = bars[0];
									retData.jwt = jwtHandler.generatejwt({openid:openid,userType:"student"});
									httpRet.alertMsg(response,'success',"学生登录成功",retData);
									}
							}
					});
				}
		});
	}

	
/****************老师相关*******************/
exports.addStudent = addStudent;//
exports.modStudentProfile = modStudentProfile;//
exports.getStudentByName = getStudentByName;//
exports.getStudentByPhone = getStudentByPhone;//
exports.getStudentInfo = getStudentInfo;
exports.loginStudent = loginStudent;


