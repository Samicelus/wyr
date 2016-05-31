var uuid = require('uuid');
var https = require('https');
var serverIP = "119.29.92.190";
var serverPort = 6001;
var fs = require('fs');
var querystring = require("querystring");

var adminOpenid = 'o3EplszxRCtPF9VMsnWENqYgPn8o';//管理员01的openid 'o3EplszxRCtPF9VMsnWENqYgPn8o' sam:'o3Epls2TMaiah_iI-GLwi9CxVKeQ'
	
/************************************************************
函数名:sendCourseAuthMessage(db,xid)	
参数及释义：
db							操作的数据库对象
xid							课程的id
函数作用：
    发送新添加课程提醒给管理员审核
作者：徐思源
时间：20160308
************************************************************/
function sendCourseAuthMessage(db,xid){
	console.log("sendCourseAuthMessage...");
	//首先获取AccessToken
	db.collection('api', function(err, collection) {
		if(err){
			console.log(err);
			}else{
				var condition = {appid:"wx6585c007ff6e5490"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log(err);
						}else{
							if(bars.length == 0){
								console.log('appid not found');
								}else{
									var AT = bars[0].access_token;
									//接下来通过xid获取课程信息
									db.collection('order', function(err, collection) {
										if(err){
											console.log(err);
											}else{
												var condition = {_id:xid,state:1};
												collection.find(condition).toArray(function(err,bars){
													if(err){
														console.log(err);
														}else{
															if(bars.length == 0){
																console.log('order not found'); 
																}else{
																	var teacherOpenid = bars[0].openid;
																	var courseName = bars[0].courseName;
																	var day = bars[0].day;
																	var addressId = bars[0].address1;
																	var courseType = bars[0].courseType;
																	var homeService = bars[0].homeService;
																	//接下来通过teacherOpenid获取教师姓名
																	db.collection('user', function(err, collection){
																		if(err){
																			console.log(err);
																			}else{
																				var condition = {openid:teacherOpenid,userType:'teacher'};
																				collection.find(condition).toArray(function(err,bars){
																					if(err){
																						console.log(err);
																						}else{
																							if(bars.length == 0){
																								console.log('teacher with this openid not found'); 
																								}else{
																									var teacherName = bars[0].userName;
																									var teacherPhoneNum = bars[0].phoneNum;
																									if(addressId == 'none'){
																										var address = '上门授课';
																										//发送消息
																										var postData = new Object();
																										postData.touser = adminOpenid;
																										postData.template_id = 'XSbxGzGVNIN9_E9jkiVkFo2qPjPs6rZsQNkCPtF5hWs';
																										postData.url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6585c007ff6e5490&redirect_uri=http://www.wanyirart.cc/authCourse.html?courseId='+xid+'&response_type=code&scope=snsapi_userinfo';
																										postData.topcolor = "#FF0000";
																										postData.data = new Object();
																										postData.data.first = new Object();
																										postData.data.first.value = '新课程待审核';
																										postData.data.first.color = "#173177";
																										postData.data.keyword1 = new Object();
																										postData.data.keyword1.value = courseType;
																										postData.data.keyword1.color = "#173177";
																										postData.data.keyword2 = new Object();
																										postData.data.keyword2.value = teacherName;
																										postData.data.keyword2.color = "#173177";
																										postData.data.keyword3 = new Object();
																										postData.data.keyword3.value = teacherPhoneNum;
																										postData.data.keyword3.color = "#173177";
																										postData.data.keyword4 = new Object();
																										postData.data.keyword4.value = day;
																										postData.data.keyword4.color = "#173177";
																										postData.data.keyword5 = new Object();
																										postData.data.keyword5.value = address;
																										postData.data.keyword5.color = "#173177";
																										postData.data.remark = new Object();
																										postData.data.remark.value = "点击查看课程详情并审核";
																										postData.data.remark.color = "#173177";
																										console.log(JSON.stringify(postData));
																										sendPostDataCallback(AT,postData,function(receivedData){
																											console.log(receivedData); 
																											});
																										}else{
																											//接下来通过addressId获取授课地址
																											db.collection('address', function(err, collection){
																												if(err){
																													console.log(err);
																													}else{
																														var condition = {_id:addressId};
																														collection.find(condition).toArray(function(err,bars){
																															if(err){
																																console.log(err);
																																}else{
																																	if(bars.length == 0){
																																		console.log('address not found'); 
																																		}else{
																																			var address = bars[0].address;
																																			//发送消息
																																			var postData = new Object();
																																			postData.touser =  adminOpenid;
																																			postData.template_id = 'XSbxGzGVNIN9_E9jkiVkFo2qPjPs6rZsQNkCPtF5hWs';
																																			postData.url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6585c007ff6e5490&redirect_uri=http://www.wanyirart.cc/authCourse.html?courseId='+xid+'&response_type=code&scope=snsapi_userinfo';
																																			postData.topcolor = "#FF0000";
																																			postData.data = new Object();
																																			postData.data.first = new Object();
																																			postData.data.first.value = '新课程待审核';
																																			postData.data.first.color = "#173177";
																																			postData.data.keyword1 = new Object();
																																			postData.data.keyword1.value = courseType;
																																			postData.data.keyword1.color = "#173177";
																																			postData.data.keyword2 = new Object();
																																			postData.data.keyword2.value = teacherName;
																																			postData.data.keyword2.color = "#173177";
																																			postData.data.keyword3 = new Object();
																																			postData.data.keyword3.value = teacherPhoneNum;
																																			postData.data.keyword3.color = "#173177";
																																			postData.data.keyword4 = new Object();
																																			postData.data.keyword4.value = day;
																																			postData.data.keyword4.color = "#173177";
																																			postData.data.keyword5 = new Object();
																																			postData.data.keyword5.value = address;
																																			postData.data.keyword5.color = "#173177";
																																			postData.data.remark = new Object();
																																			postData.data.remark.value = "点击查看课程详情并审核";
																																			postData.data.remark.color = "#173177";
																																			console.log(JSON.stringify(postData));
																																			sendPostDataCallback(AT,postData,function(receivedData){
																																				console.log(receivedData); 
																																				});
																																			}
																																	}
																															});
																														}
																												});
																											}
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
							}
					});
				}
		});	
}

/************************************************************
函数:sendOrderMessage(db,out_trade_no)
参数及释义：
db
out_trade_no
函数作用:
	发送新订单模板消息
作者：徐思源
时间:20160203
************************************************************/	
function sendOrderMessage(db,out_trade_no){
	//首先获取AccessToken
	db.collection('api', function(err, collection) {
		if(err){
			console.log(err);
			}else{
				var condition = {appid:"wx6585c007ff6e5490"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log(err);
						}else{
							if(bars.length == 0){
								console.log('appid not found');
								}else{
									var AT = bars[0].access_token;
									//查询订单金额,老师openid,订单支付状态教学名称订单时间
									db.collection('order', function(err, collection) {
										if(err){
											console.log(err);
											}else{
												var condition = {out_trade_no:out_trade_no};
												collection.find(condition).toArray(function(err,bars){
													if(err){
														console.log(err);
														}else{
															if(bars.length == 0){
																console.log('out_trade_no not found');
																}else{
																	var fee = bars[0].price;
																	var openid = bars[0].openid;
																	var stateCode = bars[0].state;
																	var state  = "";
																	switch (stateCode){
																		case 0:
																			state = "已删除/拒绝审核";
																			break;
																		case 1:
																			state = "未审核";
																			break;
																		case 2:
																			state = "已审核";
																			break;
																		case 3:
																			state = "已付款";
																			break;
																		case 4:
																			state = "已退款";
																			break;
																		case 9:
																			state = "已结束";
																			break;
																		default:
																			state = "其他状态";
																			break;
																		}
																	var courseName = bars[0].courseName;
																	var studentOpenid = bars[0].paidOpenid;
																	//接下来通过studentOpenid获取学生的信息																	
																	db.collection('user', function(err, collection) {
																		if(err){
																			console.log(err);
																			}else{
																				var condition = {openid:studentOpenid,userType:"student"};
																				collection.find(condition).toArray(function(err,bars){
																					if(err){
																						console.log(err);
																						}else{
																							if(bars.length == 0){
																								console.log('student with this openid not found'); 
																								}else{
																									var studentName = bars[0].userName;
																									var phoneNum = bars[0].phoneNum;
																									var myDate=getChineseDate();
																									var postData = new Object();
																									postData.touser = openid;
																									postData.template_id = '_pf9AdAhm1JdeIck-Q1hNPzizxZts9nUmGqq5CbLa3s';
																									postData.url = 'http://www.wanyirart.cc/phoneNumPage/phoneNumPage.html?phoneNum='+phoneNum;
																									postData.topcolor = "#FF0000";
																									postData.data = new Object();
																									postData.data.first = new Object();
																									postData.data.first.value = "您有新的订单了";
																									postData.data.first.color = "#173177";
																									postData.data.keyword1 = new Object();
																									postData.data.keyword1.value = studentName;
																									postData.data.keyword1.color = "#173177";
																									postData.data.keyword2 = new Object();
																									postData.data.keyword2.value = courseName;
																									postData.data.keyword2.color = "#173177";
																									postData.data.keyword3 = new Object();
																									postData.data.keyword3.value = (fee/100)+" 元 ";
																									postData.data.keyword3.color = "#173177";
																									postData.data.keyword4 = new Object();
																									postData.data.keyword4.value = state;
																									postData.data.keyword4.color = "#173177";
																									postData.data.keyword5 = new Object();
																									postData.data.keyword5.value = myDate;
																									postData.data.keyword5.color = "#173177";
																									postData.data.remark = new Object();
																									postData.data.remark.value = "点击获取学生联系方式";
																									postData.data.remark.color = "#173177";
																									
																									console.log(JSON.stringify(postData));
																									sendPostDataCallback(AT,postData,function(receivedData){
																										console.log(receivedData); 
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
							}
					});
				}
		});
	}
	
/************************************************************
函数名:sendCheckCourseMessage(db,id,openid,studentOpenid,courseName)	
参数及释义：
db							操作的数据库对象
id							课程订单的id
openid						教师的openid
studentOpenid				学生的openid
comment						老师评语
courseName					课程名称
函数作用：
    发送课程签到信息给学生
作者：徐思源
时间：20160308
************************************************************/
function sendCheckCourseMessage(db,id,openid,studentOpenid,comment,courseName){
	//首先获取AccessToken
	db.collection('api', function(err, collection) {
		if(err){
			console.log(err);
			}else{
				var condition = {appid:"wx6585c007ff6e5490"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log(err);
						}else{
							if(bars.length == 0){
								console.log('appid not found');
								}else{
									var AT = bars[0].access_token;
									//接下来通过studentOpenid获取老师的信息																	
									db.collection('user', function(err, collection) {
										if(err){
											console.log(err);
											}else{
												var condition = {openid:openid,userType:"teacher"};
												collection.find(condition).toArray(function(err,bars){
													if(err){
														console.log(err);
														}else{
															if(bars.length == 0){
																console.log('teacher with this openid not found'); 
																}else{
																	var teacherName = bars[0].userName;
																	//接下来通过studentOpenid获取学生的信息
																	db.collection('user', function(err, collection) {
																		if(err){
																			console.log(err);
																			}else{
																				var condition = {openid:studentOpenid,userType:"student"};
																				collection.find(condition).toArray(function(err,bars){
																					if(err){
																						console.log(err);
																						}else{
																							if(bars.length == 0){
																								console.log('student with this openid not found'); 
																								}else{
																									var studentName = bars[0].userName;
																									var myDate=getChineseDate();
																									var postData = new Object();
																									postData.touser = studentOpenid;
																									postData.template_id = 'uSTl6Gc2W22cwjTxNMxz37Pn6tgwk0V9CxSEjPX2DUk';
																									postData.url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6585c007ff6e5490&redirect_uri=http://www.wanyirart.cc/checkCourse.html?courseId='+id+'&response_type=code&scope=snsapi_userinfo';
																									postData.topcolor = "#FF0000";
																									postData.data = new Object();
																									postData.data.first = new Object();
																									postData.data.first.value = '老师点评:"'+comment+'"';
																									postData.data.first.color = "#173177";
																									postData.data.keyword1 = new Object();
																									postData.data.keyword1.value = studentName;
																									postData.data.keyword1.color = "#173177";
																									postData.data.keyword2 = new Object();
																									postData.data.keyword2.value = myDate;
																									postData.data.keyword2.color = "#173177";
																									postData.data.keyword3 = new Object();
																									postData.data.keyword3.value = courseName;
																									postData.data.keyword3.color = "#173177";
																									postData.data.keyword4 = new Object();
																									postData.data.keyword4.value = teacherName;
																									postData.data.keyword4.color = "#173177";
																									postData.data.remark = new Object();
																									postData.data.remark.value = "点击签到并评价老师课程";
																									postData.data.remark.color = "#173177";
																									
																									console.log(JSON.stringify(postData));
																									sendPostDataCallback(AT,postData,function(receivedData){
																										console.log(receivedData); 
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
							}
					});
				}
		});	
}	
	
	
/************************************************************
函数名:sendTeacherAuthMessage(db,openid,userName)	
参数及释义：
db							操作的数据库对象
openid						老师的openid
userName					老师的名字
函数作用：
    发送老师实名认证审核信息给管理员
作者：徐思源
时间：20160308
************************************************************/
function sendTeacherAuthMessage(db,openid,userName){
	//首先获取AccessToken
	db.collection('api', function(err, collection) {
		if(err){
			console.log(err);
			}else{
				var condition = {appid:"wx6585c007ff6e5490"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log(err);
						}else{
							if(bars.length == 0){
								console.log('appid not found');
								}else{
									var AT = bars[0].access_token;
									//接下来通过openid获取老师的_id
									db.collection('user', function(err, collection) {
										if(err){
											console.log(err);
											}else{
												var condition = {openid:openid,userType:"teacher"};
												collection.find(condition).toArray(function(err,bars){
													if(err){
														console.log(err);
														}else{
															if(bars.length == 0){
																console.log('teacher with this openid not found'); 
																}else{
																	var teacherId = bars[0]._id;
																	var myDate=getChineseDate();
																	var postData = new Object();
																	postData.touser = adminOpenid;
																	postData.template_id = '';
																	postData.url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6585c007ff6e5490&redirect_uri=http://www.wanyirart.cc/modTeacherState.html?teacherId='+teacherId+'&response_type=code&scope=snsapi_userinfo';
																	postData.topcolor = "#FF0000";
																	postData.data = new Object();
																	postData.data.first = new Object();
																	postData.data.first.value = '教师实名认证审核信息通知';
																	postData.data.first.color = "#173177";
																	postData.data.keyword1 = new Object();
																	postData.data.keyword1.value = userName;
																	postData.data.keyword1.color = "#173177";
																	postData.data.keyword2 = new Object();
																	postData.data.keyword2.value = myDate;
																	postData.data.keyword2.color = "#173177";
																	postData.data.remark = new Object();
																	postData.data.remark.value = "点击查看老师身份证信息";
																	postData.data.remark.color = "#173177";
																	console.log(JSON.stringify(postData));
																	sendPostDataCallback(AT,postData,function(receivedData){
																		console.log(receivedData); 
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
函数名:sendTeacherAuthResult(db,id,auth)	
参数及释义：
db							操作的数据库对象
id							老师的openid
userName					老师的名字
函数作用：
    发送老师实名认证审核结果
作者：徐思源
时间：20160308
************************************************************/
function sendTeacherAuthResult(db,id,auth){
	//首先获取AccessToken
	db.collection('api', function(err, collection) {
		if(err){
			console.log(err);
			}else{
				var condition = {appid:"wx6585c007ff6e5490"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log(err);
						}else{
							if(bars.length == 0){
								console.log('appid not found');
								}else{
									var AT = bars[0].access_token;
									//接下来通过id获取老师的openid和姓名
									db.collection('user', function(err, collection) {
										if(err){
											console.log(err);
											}else{
												var condition = {openid:id,userType:"teacher"};
												collection.find(condition).toArray(function(err,bars){
													if(err){
														console.log(err);
														}else{
															if(bars.length == 0){
																console.log('teacher with this openid not found'); 
																}else{
																	var teacherOpenid = bars[0].openid;
																	var teacherName = bars[0].userName;
																	var teacherPhoneNum = bars[0].phoneNum;
																	//接下来通过homeAddressId获取教师住址信息
																	var postData = new Object();
																	postData.touser = teacherOpenid;
																	postData.template_id = 'xM3bEIamKblB24NzqOVyPsKm9RUo8S9sykcCdV-BHR8';
																	postData.url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6585c007ff6e5490&redirect_uri=http://www.wanyirart.cc/wy/index.html&response_type=code&scope=snsapi_userinfo';
																	postData.topcolor = "#FF0000";
																	postData.data = new Object();
																	postData.data.first = new Object();
																	postData.data.first.value = '实名认证审核结果通知';
																	postData.data.first.color = "#173177";
																	postData.data.keyword1 = new Object();
																	postData.data.keyword1.value = teacherName;
																	postData.data.keyword1.color = "#173177";
																	postData.data.keyword2 = new Object();
																	postData.data.keyword2.value = teacherPhoneNum;
																	postData.data.keyword2.color = "#173177";
																	postData.data.remark = new Object();
																	postData.data.remark.value = "如有疑问，请联系玩艺儿客服";
																	postData.data.remark.color = "#173177";
																	console.log(JSON.stringify(postData));
																	sendPostDataCallback(AT,postData,function(receivedData){
																		console.log(receivedData); 
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
函数名:applyShopAddress(db,openid,shopAddressId,util,response)
参数及释义：
db							操作的数据库对象
openid						教师的openid
shopAddressId
util						教师填写的用途
response					用于返回get请求的对象体
函数作用：
    申请成为商铺地址使用者
作者：徐思源
时间：20151230
************************************************************/
function applyShopAddress(db,openid,shopAddressId,util,response){
	db.collection("address", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {addressType:"shop",_id:shopAddressId};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到该商户的商铺地址");
								httpRet.alertMsg(response,'error',"没有找到该商户的商铺地址",'0');
								}else{
									//获取地址信息
									var address = bars[0].address;
									var toUser = bars[0].openid;
									//接下来查询老师的信息
									db.collection("user", function(err, collection){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');
											}else{
												var condition = {openid:openid,userType:"teacher"};
												collection.find(condition).toArray(function(err,bars2){
													if(err){
														console.log("error:"+err);
														httpRet.alertMsg(response,'error',err,'0');
														}else{
															if(bars.length == 0){
																console.log("没有找到该openid对应的老师");
																httpRet.alertMsg(response,'error',"没有找到该openid对应的老师",'0');
																}else{
																	var userName = bars2[0].userName;
																	var phoneNum = bars2[0].phoneNum;
																	//查询该openid是否在商户的屏蔽列表中
																	var condition = {openid:toUser,shieldList:{$in:[openid]}};
																	collection.find(condition).toArray(function(err,bars2){
																		if(err){
																			console.log("error:"+err);
																			httpRet.alertMsg(response,'error',err,'0');
																			}else{
																				if(bars.length == 0){
																					//可以发送消息
																					var myDate=getChineseDate();
																					var postData = new Object();
																					postData.touser = toUser;
																					postData.template_id = '';
																					postData.url = 'http://www.wanyirart.cc/addressApply/addressApply.html?phoneNum='+phoneNum+'&userName='+userName+'&address='+address+'&util='+util+'&shopAddressId='+shopAddressId+'&ownerOpenid='+toUser+'&applicantOpenid='+openid;
																					postData.topcolor = "#FF0000";
																					postData.data = new Object();
																					postData.data.first = new Object();
																					postData.data.first.value = "您有一个教学场地申请";
																					postData.data.first.color = "#173177";
																					postData.data.keyword1 = new Object();
																					postData.data.keyword1.value = userName;
																					postData.data.keyword1.color = "#173177";
																					postData.data.keyword2 = new Object();
																					postData.data.keyword2.value = phoneNum;
																					postData.data.keyword2.color = "#173177";
																					postData.data.keyword3 = new Object();
																					postData.data.keyword3.value = util;
																					postData.data.keyword3.color = "#173177";
																					postData.data.keyword4 = new Object();
																					postData.data.keyword4.value = address;
																					postData.data.keyword4.color = "#173177";
																					postData.data.keyword5 = new Object();
																					postData.data.keyword5.value = myDate;
																					postData.data.keyword5.color = "#173177";
																					postData.data.remark = new Object();
																					postData.data.remark.value = "请及时与申请者联系，点击可以通过或拒绝申请，通过后该申请者将可以以该地址作为教学场地发布教学";
																					postData.data.remark.color = "#173177";
																					
																					console.log(JSON.stringify(postData));
																					sendPostDataCallback(AT,postData,function(receivedData){
																						console.log(receivedData); 
																						});
																					}else{
																						console.log("目标商户拒绝来自你的消息");
																						httpRet.alertMsg(response,'error',"目标商户拒绝来自你的消息",'0');
																						}
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
	
exports.sendCourseAuthMessage = sendCourseAuthMessage;
exports.sendOrderMessage = sendOrderMessage;
exports.sendCheckCourseMessage = sendCheckCourseMessage;
exports.sendTeacherAuthMessage = sendTeacherAuthMessage;
exports.sendTeacherAuthResult = sendTeacherAuthResult;
exports.applyShopAddress = applyShopAddress;

	
//向微信发送post请求，回调模式
function sendPostDataCallback(access_token,postData,callback){
	var buf = new Buffer(JSON.stringify(postData),'utf-8')
	var options = {
		hostname: 'api.weixin.qq.com',
		port: 443,
		path: '/cgi-bin/message/template/send?access_token='+access_token,
		method: 'POST',
		headers: {'Content-Type': 'multipart/form-data','Content-Length': buf.length}
		};
	var req = https.request(options, function(res) {
		res.setEncoding('utf8');
		var receivedData = "";
		res.on('data',function(chunk){
			receivedData += chunk;
			});
		res.on('end',function(){
			callback(receivedData);
			receivedData = "";
			});
		});
	req.on('error', function(e){
		console.log('problem with request: ' + e.message);
		});
	req.write(buf);
	req.end();	
	}
	
//获取当前系统中文日期格式
function getChineseDate(){
	var dateTemp = new Date();
	var dateStr = dateTemp.getFullYear()+"年"+(dateTemp.getMonth()+1)+"月"+dateTemp.getDate()+"日 "+dateTemp.getHours()+":"+dateTemp.getMinutes()+":"+dateTemp.getSeconds();
	return dateStr;
}