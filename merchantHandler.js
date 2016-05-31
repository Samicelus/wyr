var uuid = require('uuid');
var http = require('http');
var https = require('https');
var httpRet = require('./httpRet')
var crypto = require('crypto');
var str_tmp ="";
var serverIP = "119.29.92.190";
var fs = require('fs');
	
/************************************************************
函数名:addMerchant(db,openid,phoneNum,authCode,response)
参数及释义：
db							操作的数据库对象
openid						用户openid
phoneNum					手机号
authCode					验证码
response					用于返回get请求的对象体
函数作用：
    注册商户
作者：徐思源
时间：20151230
************************************************************/
function addMerchant(db,openid,phoneNum,authCode,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				//查询用户是否已经注册为商户
				var condition = {openid:openid,userType:"merchant"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length != 0){
								//用户已注册成为商户
								console.log("已经注册成为商户,无法重复注册");
								httpRet.alertMsg(response,'error',"已经注册成为商户,无法重复注册",'0');								
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
																				//注册为商户,state=0为未审核通过
																				var userData = {_id:xid,openid:openid,phoneNum:phoneNum,userType:"merchant",state:1};
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
函数名:loginMerchant(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    商户登录
作者：徐思源
时间：20151230
************************************************************/
function loginMerchant(db,openid,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,userType:"merchant"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("登录失败,尚未注册为商户");
								httpRet.alertMsg(response,'error',"登录失败,尚未注册为商户",'0');
								}else{
									console.log("商户登录成功");
									httpRet.alertMsg(response,'success',"商户登录成功",bars);
									}
							}
					});
				}
		});
	}	

	
/****************商户相关*******************/
exports.addMerchant = addMerchant;
exports.loginMerchant = loginMerchant;



