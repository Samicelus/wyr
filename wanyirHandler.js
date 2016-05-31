var uuid = require('uuid');
var http = require('http');
var https = require('https');
var httpRet = require('./httpRet')
var crypto = require('crypto');
var str_tmp ="";
var serverIP = "119.29.92.190";
var fs = require('fs');


/************************************************************
函数名:addHomeAddress(db,openid,address,lat,lnt,response)
参数及释义：
db							操作的数据库对象
openid
address
lat
lnt
response					用于返回get请求的对象体
函数作用：
    添加家庭住址,homeAddressNum递增
作者：徐思源
时间：20151230
************************************************************/
function addHomeAddress(db,openid,address,lat,lnt,response){
	var xid = uuid.v4();
	db.collection("address", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				//查询该openid已有家庭住址
				var condition = {openid:openid,addressType:"home"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//还没有家庭住址
								var addressData = {_id:xid,openid:openid,addressType:"home",homeAddressNum:1,address:address,lat:lat,lnt:lnt};
								collection.insert(addressData,function(err,data){
									if(err){
										console.log("error:"+err);
										httpRet.alertMsg(response,'error',err,'0');
										}else{
											console.log("添加家庭住址成功");
											httpRet.alertMsg(response,'success',"添加家庭住址成功",data);
											}
									});
								}else{
									//已有家庭住址,获取最大homeAddressNum
									var max = 0;
									for(var i in bars){
										if(bars[i].homeAddressNum > max){
											max = bars[i].homeAddressNum;
											}
										}
									var homeAddressNum = max + 1;
									var addressData = {_id:xid,openid:openid,addressType:"home",homeAddressNum:homeAddressNum,address:address,lat:lat,lnt:lnt};
									collection.insert(addressData,function(err,data){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');
											}else{
												console.log("添加家庭住址成功");
												httpRet.alertMsg(response,'success',"添加家庭住址成功",data);
												}
										});
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:getHomeAddress(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    查询某openid下的家庭地址
作者：徐思源
时间：20151230
************************************************************/
function getHomeAddress(db,openid,response){
	db.collection("address", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,addressType:"home"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到该教师的家庭住址");
								httpRet.alertMsg(response,'error',"没有找到该教师的家庭住址",'0');
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
函数名:addShopAddress(db,openid,address,lat,lnt,response)
参数及释义：
db							操作的数据库对象
openid
address
lat
lnt
response					用于返回get请求的对象体
函数作用：
    添加商铺地址,shopAddressNum递增
作者：徐思源
时间：20151230
************************************************************/
function addShopAddress(db,openid,address,lat,lnt,response){
	var xid = uuid.v4();
	db.collection("address", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				//查询该openid已有商铺地址
				var condition = {openid:openid,addressType:"home"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//还没有商铺地址
								var xid = uuid.v4();
								var addressData = {_id:xid,openid:openid,addressType:"shop",shopAddressNum:1,address:address,lat:lat,lnt:lnt};
								collection.insert(addressData,function(err,data){
									if(err){
										console.log("error:"+err);
										httpRet.alertMsg(response,'error',err,'0');
										}else{
											console.log("添加家庭住址成功");
											httpRet.alertMsg(response,'success',"添加家庭住址成功",data);
											}
									});
								}else{
									//已有商铺地址,获取最大shopAddressNum
									var max = 0;
									for(var i in bars){
										if(bars[i].shopAddressNum > max){
											max = bars[i].shopAddressNum;
											}
										}
									var shopAddressNum = max + 1;
									var addressData = {_id:xid,openid:openid,addressType:"shop",shopAddressNum:shopAddressNum,address:address,lat:lat,lnt:lnt};
									collection.insert(addressData,function(err,data){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');
											}else{
												console.log("添加商铺地址成功");
												httpRet.alertMsg(response,'success',"添加商铺地址成功",data);
												}
										});
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:getShopAddress(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    查询某openid下的商户地址
作者：徐思源
时间：20151230
************************************************************/
function getShopAddress(db,openid,response){
	db.collection("address", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,addressType:"shop"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到该商户的商铺地址");
								httpRet.alertMsg(response,'error',"没有找到该商户的商铺地址",'0');
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
函数名:modTeacherProfile(db,openid,userName,desShort,desLong,homeAddressNum,response)
参数及释义：
db							操作的数据库对象
openid
userName
desShort
desLong
homeAddressNum
response					用于返回get请求的对象体
函数作用：
    更新教师资料
作者：徐思源
时间：20151230
************************************************************/
function modTeacherProfile(db,openid,userName,desShort,desLong,homeAddressNum,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,userType:"teacher"};
				var mod = {$set:{userName:userName,desShort:desShort,desLong:desLong,homeAddressNum:Number(homeAddressNum),state:0}};
				collection.update(condition,mod,function(err,data){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							console.log("修改成功");
							httpRet.alertMsg(response,'success',"修改成功",data);
							//**此处应通知管理员核准							
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
函数名:modTeacherState(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    核准教师
作者：徐思源
时间：20151230
************************************************************/
function modTeacherState(db,openid,response){
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,userType:"teacher"};
				var mod = {$set:{state:1}};
				collection.update(condition,mod,function(err,data){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');						
						}else{
							console.log("核准成功");
							httpRet.alertMsg(response,'success',"核准成功",data);
							}
					});
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
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("登录失败,尚未注册为老师");
								httpRet.alertMsg(response,'error',"登录失败,尚未注册为老师",'0');
								}else{
									console.log("老师登录成功");
									httpRet.alertMsg(response,'success',"老师登录成功",bars);
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:addCourse(db,openid,courseType,preciseType,courseName,address1,address2,price,courseLength,totalCourse,trail,response)
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
response					用于返回get请求的对象体
函数作用：
    添加教学，添加前先查看state为1或2的教学是否超过数量10个
作者：徐思源
时间：20160112
************************************************************/
function addCourse(db,openid,courseType,preciseType,courseName,address1,address2,price,courseLength,totalCourse,trail,response){
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
							if(bars.length > 10){
								console.log("教学过多(超过10个)请删除已过期教学");
								httpRet.alertMsg(response,'error',"教学过多(超过10个)请删除已过期教学",'0');
								}else{
									var course = {openid:openid,courseName:courseName,courseType:courseType,preciseType:preciseType,address1:address1,address2:address2,price:price,courseLength:courseLength,totalCourse:totalCourse,trail:trail,state:1,inuse:1};
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
				var condition = {_id:id,openid:openid,$or:[{state:1},{state:2}]};
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
				var condition = {openid:openid,$or:[{state:1},{state:2}]};
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
																				var userData = {_id:xid,openid:openid,phoneNum:phoneNum,userType:"merchant",maxVideo:0,state:0};
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

/************************************************************
函数名:addShop(db,openid,shopName,response)
参数及释义：
db							操作的数据库对象
openid
shopName
response					用于返回get请求的对象体
函数作用：
    添加商铺
作者：徐思源
时间：20151230
************************************************************/
function addShop(db,openid,shopName,response){
	db.collection("shop", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {shopName:shopName};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("可以注册");
								var xid = uuid.v4();
								var shop =  {_id:xid,shopName:shopName,openid:openid,state:0};
								collection.insert(shop,function(err,data){
									if(err){
										console.log("error:"+err);
										httpRet.alertMsg(response,'error',err,'0');
										}else{
											console.log("商铺添加成功");
											httpRet.alertMsg(response,'success',"商铺添加成功",data);
											}
									});
								}else{
									console.log("该商铺名已存在");
									httpRet.alertMsg(response,'error',"该商铺名已存在",'0');
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:modShopProfile(db,openid,shopName,desShort,desLong,shopAddressNum,response)
参数及释义：
db							操作的数据库对象
openid
shopName
desShort
desLong
shopAddressNum
response					用于返回get请求的对象体
函数作用：
    更新商铺资料
作者：徐思源
时间：20151230
************************************************************/
function modShopProfile(db,openid,shopName,desShort,desLong,shopAddressNum,response){
	db.collection("shop", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,shopName:shopName};
				var mod = {$set:{desShort:desShort,desLong:desLong,shopAddressNum:Number(shopAddressNum),state:0}};
				collection.update(condition,mod,function(err,data){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							console.log("修改成功");
							httpRet.alertMsg(response,'success',"修改成功",data);
							//**此处应通知管理员核准							
							}
					});
				}
		});
	}

/************************************************************
函数名:modShopState(db,shopName,response)
参数及释义：
db							操作的数据库对象
shopName
response					用于返回get请求的对象体
函数作用：
    核准教师
作者：徐思源
时间：20151230
************************************************************/
function modShopState(db,shopName,response){
	db.collection("shop", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {shopName:shopName,state:0};
				var mod = {$set:{state:1}};
				collection.update(condition,mod,function(err,data){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');						
						}else{
							console.log("核准成功");
							httpRet.alertMsg(response,'success',"核准成功",data);
							}
					});
				}
		});
	}
	
/************************************************************
函数名:addCheckPhone(db,phoneNum,response)
参数及释义：
db							操作的数据库对象
phoneNum					客户注册用的手机号
response					用于返回get请求的对象体
函数作用：
   向checkPhone中加入手机号及生成验证码
作者：徐思源
时间：20150729
************************************************************/
function addCheckPhone(db,phoneNum,response){
	db.collection("user",function(err,collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				var condition = {phoneNum:phoneNum,openid:{$exists:1}};
				collection.find(condition).toArray(function(err, bars){
					if(bars.length != 0){
						console.log("该手机号已被绑定");
						httpRet.alertMsg(response,'error',"该手机号已被绑定",'0'); 
						}else{
							db.collection("checkPhone", function(err, collection) {
								if(err){
									console.log("error:"+err);
									httpRet.alertMsg(response,'error',err,'0'); 
									}else{
										/* Generate UUID(16 Bytes) and convert to BinaryData object for mongodb */
										var xid = uuid.v4();
										console.log(xid);
										var condition = {phoneNum: phoneNum};
										var affiche = {phoneNum: 1,Authcode: 1,timestamp: 1};
										collection.find(condition, affiche).toArray(function(error,bars){
											if(err){
												console.log("err:"+err);
												httpRet.alertMsg(response,'error',err,'0'); 
												}else{
													var match = 0;
													var timestamp = 0;
													for(var i in bars){
														if(phoneNum == bars[i].phoneNum){
															match = 1;
															timestamp = bars[i].timestamp;
															break;
															}
														}
													if(match == 1){
														var timestampNow = Date.parse(new Date());
														if((timestampNow-timestamp)>120000){
															var code = Math.round(1+Math.random()*1000000).toString().slice(-6);
																//更新数据库验证码
																var condition ={phoneNum:phoneNum};
																var mod = {$set:{code:code,timestamp:timestampNow}};
																	collection.update(condition,mod,function(err,bars){
																		if(err){
																			console.log("error:"+error);
																			httpRet.alertMsg(response,'error',err,'0'); 
																			}else{
																				console.log("new code is stored.");
																				//这里发送新验证码
																				sendCheckCode(phoneNum,code,response);
																				}
																	});
															}else{
																var ret = "发送手机验证码的间隔过短，请等待120秒再试"
																console.log(ret);
																httpRet.alertMsg(response,'error',"发送手机验证码的间隔过短，请等待120秒再试",'0');
															}
														}else{
															var timestampNow = Date.parse(new Date());
															var code = Math.round(Math.random()*1000000);
															collection.insert({
																_id: xid,
																phoneNum: phoneNum,
																code: code,
																timestamp:timestampNow
															}, function(err, data) {
															if (data) {
																//这里发送验证码
																sendCheckCode(phoneNum,code,response);
																} else {
																	console.log('err:'+err);
																	httpRet.alertMsg(response,'error',err,'0');
																	}
																}); 
																
															}
													}	
											});
										}
								});
							}
					});
				}
	});
}	

/*
私有方法:发送手机验证码
*/
function sendCheckCode(phoneNum,code,response){
	var str_tmp = "";
	http.get("http://api.k780.com:88/?app=sms.send&tempid=50237&param=code%3d"+code+"&phone="+phoneNum+"&appkey=14833&sign=eb7583cd8e188128454718664551c522&format=json", function(res){
		res.on('data', function (chunk){
			str_tmp+=chunk;
			if(str_tmp.slice(-1)==='}'){
				console.log("str_tmp : "+str_tmp);
				var json_tmp =JSON.parse(str_tmp);
				if(json_tmp.success == "1"){
					httpRet.alertMsg(response,'success','code sent','0');
					}
				}
			});
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
			httpRet.alertMsg(response,'error','error when sending sms',e.message);
			});		
}

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


exports.addCheckPhone = addCheckPhone;//

/****************地址相关*******************/
exports.addHomeAddress = addHomeAddress;//
exports.getHomeAddress = getHomeAddress;
exports.addShopAddress = addShopAddress;
exports.getShopAddress = getShopAddress;

/****************老师相关*******************/
exports.addTeacher = addTeacher;//
exports.modTeacherProfile = modTeacherProfile;//
exports.getTeacherByName = getTeacherByName;//
exports.getTeacherByPhone = getTeacherByPhone;//
exports.modTeacherState = modTeacherState;//
exports.loginTeacher = loginTeacher;

/****************课程相关*******************/
exports.addCourse = addCourse;
exports.delectCourse = delectCourse;
exports.getMyCourse = getMyCourse;
exports.getWaitCourse = getWaitCourse;
exports.authCourse = authCourse;

/****************商户相关*******************/
exports.addMerchant = addMerchant;
exports.loginMerchant = loginMerchant;
exports.addShop = addShop;
exports.modShopProfile = modShopProfile;
exports.modShopState = modShopState;


/****************优酷视频相关*******************/
exports.addVideo = addVideo;
exports.getMyVideo = getMyVideo;

