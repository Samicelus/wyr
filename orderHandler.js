var uuid = require('uuid');
var http = require('http');
var https = require('https');
var crypto = require('crypto');
var str_tmp ="";
var serverIP = "119.29.92.190";
var serverPort = 6001;
var fs = require('fs');
var dgram = require('dgram');
// s 这里是个全局的 socket
var s = dgram.createSocket('udp4');
var formidable = require('formidable');
var querystring = require("querystring");
var post = require('./post');
var httpRet = require('./httpRet');
var WXPay = require('weixin-pay');
var md5 = require('md5');
var messageHandler = require('./messageHandler');
var trendHandler =require('./trendHandler');

var wxpay = WXPay({
    appid: 'wx6585c007ff6e5490',
    mch_id: '1298263001',
    partner_key: '923f8c19733d208b8de55daf57a6278a', //微信商户平台API密钥
    pfx: fs.readFileSync('./cert/apiclient_cert.p12'), //微信商户平台证书
});


var partner_key = '923f8c19733d208b8de55daf57a6278a';

/*
state:
0		已删除
1		未审核
2		已审核
3		已支付
4		已完成
9		已完结
*/



/************************************************************
函数名:addCourse(db,openid,courseType,courseName,homeService,address1,address2,price,courseLength,totalCourse,trail,day,time,note,response)
参数及释义：
db							操作的数据库对象
openid						老师的openid
courseType					课程类型
courseName					课程名称
homeService					是否支持上门服务
address1					地址1
address2					地址2
price						价格
courseLength				课程时长
totalCourse					课程数
trail						试听课
day							星期几
time						上课时间段
note						备注
imgUrl						图片链接
response					用于返回get请求的对象体
函数作用：
    添加教学，添加前先查看state为1或2
作者：徐思源
时间：20160112
************************************************************/
function addCourse(db,openid,courseType,courseName,homeService,address1,address2,price,courseLength,totalCourse,trail,day,time,note,imgUrl,response){
	db.collection("order", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				//查看是否有10个以上未审核课程
				var condition = {openid:openid,state:1};
				collection.count(condition,function(err,data){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(data > 9){
								console.log("未审核课程达到10个，请删除失效课程或者等待审核成功。");
								httpRet.alertMsg(response,'error',"未审核课程达到10个，请删除失效课程或者等待审核成功。",'0');	
								}else{
									var xid = uuid.v4();
									var course = {_id:xid,openid:openid,courseName:courseName,courseType:courseType,homeService:homeService,address1:address1,address2:address2,price:price,courseLength:courseLength,totalCourse:totalCourse,trail:trail,day:day,time:time,note:note,imgUrl:imgUrl,state:1};
									collection.insert(course,function(err,data){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');
											}else{
												console.log("教学添加成功，请等待管理员审核");
												httpRet.alertMsg(response,'success',"教学添加成功，请等待管理员审核",data);
												//向管理员发送课程审核通知
												messageHandler.sendCourseAuthMessage(db,xid);
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
openid						老师的openid
id							课程id
response					用于返回get请求的对象体
函数作用：
    删除教学，即将该教学的state置为0
作者：徐思源
时间：20160112
************************************************************/
function delectCourse(db,openid,id,response){
	db.collection("order", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {_id:id,openid:openid};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("您帐户下没有对应教学或该教学已失效");
								httpRet.alertMsg(response,'error',"您帐户下没有对应教学或该教学已失效",'0');
								}else{
									var mod = {$set:{state:0}};
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
    获取我的所有没有被删除的教学
作者：徐思源
时间：20160112
************************************************************/
function getMyCourse(db,openid,response){
	db.collection("order", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,state:{$ne:0}};
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
    获取所有state为1的教学(后台功能)
作者：徐思源
时间：20160112
************************************************************/
function getWaitCourse(db,response){
	db.collection("order", function(err, collection){
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
函数名:authCourse(db,id,response)
参数及释义：
db							操作的数据库对象
id							课程的id
response					用于返回get请求的对象体
函数作用：
    修改对应id的state为1的教学,将其state置为2，生成out_trade_no
作者：徐思源
时间：20160112
************************************************************/
function authCourse(db,id,response){
	db.collection("order", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {_id:id,state:1};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到对应教学id或该教学不在待审核状态");
								httpRet.alertMsg(response,'error',"没有找到对应教学id或该教学不在待审核状态",'0');
								}else{
									var timestampNow = Date.parse(new Date());
									var out_trade_no = (new Date()).getTime()+Math.random().toString().substr(2,10);
									var nonce_str = generateNonceString(32);
									var mod = {$set:{state:2,out_trade_no:out_trade_no,nonce_str:nonce_str}};
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
函数名:unauthCourse(db,id,unauth,response)
参数及释义：
db							操作的数据库对象
id							课程的id
unauth						unauth理由
response					用于返回get请求的对象体
函数作用：
    修改对应id的state为1的教学,添加unauth理由
作者：徐思源
时间：20160112
************************************************************/
function unauthCourse(db,id,unauth,response){
	db.collection("order", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {_id:id,state:1};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到对应教学id或该教学不在待审核状态");
								httpRet.alertMsg(response,'error',"没有找到对应教学id或该教学不在待审核状态",'0');
								}else{
									var mod = {$set:{unauth:unauth,state:0}};
									collection.update(condition,mod,function(err,data){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');	
											}else{
												httpRet.alertMsg(response,'success',"拒绝审核成功",data);
												}
										});
									}
							}
					});
				}
		});		
	}

/************************************************************
函数名:findCourseByType(db,courseType,courseName,response)
参数及释义：
db							操作的数据库对象
courseType				
courseName
response					用于返回get请求的对象体
函数作用：
    查询所有名称中含关键词courseName并且类型为preciseType的教学
时间：20160112
************************************************************/
function findCourseByType(db,courseType,courseName,response){
	db.collection("order", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {courseName:{$regex:courseName},courseType:courseType,state:2};
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
函数名:addCourseTime(db,openid,order_id,firstTime,interval,response)
参数及释义：
db							操作的数据库对象
firstTime
interval
response					用于返回get请求的对象体
函数作用：
    指定课程的首次上课时间和时间间隔
时间：20160531
************************************************************/
function addCourseTime(db,openid,order_id,firstTime,interval,response){
	db.collection("order", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,_id:order_id};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到符合条件的教学");
								httpRet.alertMsg(response,'error',"没有找到符合条件的教学",'0');
								}else{
									mod = {$set:{firstTime:firstTime,interval,interval}};
									collection.update(condition,mod,function(err,data){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');
											}else{
												httpRet.alertMsg(response,'success',"修改教学时间成功",data);
												}
										});
									
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:createPrepayLink(db,id,response)
参数及释义：
db							操作的数据库对象
id							课程的id
response					用于返回get请求的对象体
函数作用：
    生成预付单，回传支付链接
作者：徐思源
时间：20151013
************************************************************/
function createPrepayLink(db,id,response){
	//获取order信息
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {_id:id,state:2};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有此订单
								httpRet.alertMsg(response,'error','没有订单信息','0');			
								}else{
									var itemName = bars[0].courseName;
									var itemId = bars[0].id;
									var fee = bars[0].price;
									var out_trade_no = bars[0].out_trade_no;
									var nonce_str = bars[0].nonce_str;
									//这里向weixin发送post请求...
									var opts = {
										body: itemName,
										out_trade_no: out_trade_no,
										total_fee: fee,
										spbill_create_ip: '119.29.92.190',
										notify_url: 'http://119.29.92.190:6002',
										trade_type: 'NATIVE',
										product_id: itemId,
										nonce_str:nonce_str
										};					
									wxpay.createUnifiedOrder(opts,function(err, result){
										var nonce_str = result.nonce_str;
										var sign = result.sign;
										//这里应该根据算法验证消息来源的正确性				
										var obj = result;
										try{
											var signVer = mix(obj);
											}catch(e){
												console.log(e);
												}
										if(signVer == sign){
											console.log("sign verified");
											var result_code = result.result_code;
											if(result_code == "SUCCESS"){
												var code_url = result.code_url;
												console.log("code_url :"+code_url);
												console.log("saving and sending code_url back to user...");
												//存储支付链接到订单
												var mod = {$set:{prepayLink:code_url}};
												collection.update(condition,mod,function(err,data){
													if(err){
														httpRet.alertMsg(response,'error','获取到支付链接,存储失败',{result_code:result_code,code_url:code_url,err:err});
														}else{
															httpRet.alertMsg(response,'success','获取到支付链接',{result_code:result_code,code_url:code_url});
															}
													});
												}	
											if(result_code == "FAIL"){
												var err_code = result.err_code;
												console.log("err_code :"+err_code);
												var err_code_des = result.err_code_des;
												console.log("err_code_des :"+err_code_des);
												httpRet.alertMsg(response,'error',err_code_des,{result_code:result_code,err_code:err_code,err_code_des:err_code_des});
												}											
											}else{
												console.log("sign not verified");
												}										
										});	
									}
							}				
					});
				}
		});	
	}

	
/************************************************************
函数名:getOrderInfo(db,id,response)
参数及释义：
db							操作的数据库对象
id							订单的id
response					用于返回get请求的对象体
函数作用：
    查找提供者的所有商品
作者：徐思源
时间：20151013
************************************************************/
function getOrderInfo(db,id,response){
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该商品是否存在
				var condition = {_id:id};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个商品
								httpRet.alertMsg(response,'error','没有该订单','0');			
								}else{
									httpRet.alertMsg(response,'success','订单查询成功',bars); 
									}
							}
					});
				}
		});
	}
	
/************************************************************
函数名:getAllMyOrder(db,openid,response)
参数及释义：
db							操作的数据库对象
openid						下单者的openid
response					用于返回get请求的对象体
函数作用：
    查找该openid下的所有订单
作者：徐思源
时间：20151013
************************************************************/
function getAllMyOrder(db,openid,response){
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {openid:openid};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								httpRet.alertMsg(response,'error','没有该订单','0');			
								}else{
									httpRet.alertMsg(response,'success','订单查询成功',bars); 
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:getAllMyUnpaidOrder(db,openid,response)
参数及释义：
db							操作的数据库对象
openid						下单者的openid
response					用于返回get请求的对象体
函数作用：
    查找该openid下的所有未支付订单
作者：徐思源
时间：20151013
************************************************************/
function getAllMyUnpaidOrder(db,openid,response){
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {paidOpenid:openid,state:0};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								httpRet.alertMsg(response,'error','没有该订单','0');			
								}else{
									httpRet.alertMsg(response,'success','订单查询成功',bars); 
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:getAllMyPaidOrder(db,openid,response)
参数及释义：
db							操作的数据库对象
openid						下单者的openid
response					用于返回get请求的对象体
函数作用：
    查找该openid下的所有已支付订单
作者：徐思源
时间：20151013
************************************************************/
function getAllMyPaidOrder(db,openid,response){
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {openid:openid,state:3};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								httpRet.alertMsg(response,'error','没有该订单','0');			
								}else{
									httpRet.alertMsg(response,'success','订单查询成功',bars); 
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:getAllMyRefundOrder(db,openid,response)
参数及释义：
db							操作的数据库对象
openid						下单者的openid
response					用于返回get请求的对象体
函数作用：
    查找该openid下的所有已退款订单
作者：徐思源
时间：20160203
************************************************************/
function getAllMyRefundOrder(db,openid,response){
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {openid:openid,state:4};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								httpRet.alertMsg(response,'error','没有该订单','0');			
								}else{
									httpRet.alertMsg(response,'success','订单查询成功',bars); 
									}
							}
					});
				}
		});
	}


/************************************************************
函数名:updateOrderInfo(db,out_trade_no,openid,transaction_id,total_fee)
参数及释义：
db							操作的数据库对象
out_trade_no				订单号
openid						支付者openid
transaction_id				微信支付交易单号

函数作用：
    查找提供者的所有商品
作者：徐思源
时间：20151013
************************************************************/
function updateOrderInfo(db,out_trade_no,openid,transaction_id,total_fee){
	db.collection('order', function(err, collection) {
		if(err){
			console.log('error when opening order collection'); 
			}else{
				//检查该订单是否存在
				var condition = {out_trade_no:out_trade_no};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log('error when searching for order out_trade_no:'+out_trade_no); 
						}else{
							if(bars.length == 0){
								//没有这个订单
								console.log("can not find order out_trade_no:"+out_trade_no); 		
								}else{
									//获取订单信息以生成动态
									var address1_id = bars[0].address1;			//地址的id
									var courseName = bars[0].courseName;		//课程名字
									var totalCourse = bars[0].totalCourse;		//课数
									var time = bars[0].time;					//授课时间
									var firstTime= bars[0].firstTime;			//第一次授课时间（天）
									var interval= bars[0].interval;				//授课间隔（天）
									var teacher_openid = bars[0].openid;		//
									var student_openid = bars[0].paidOpenid;	//
									//验证支付金额是否正确
									if(bars[0].price != Number(total_fee)){
										console.log("order price:"+bars[0].price+" does not match to paid total_fee:"+total_fee);
										//记录支付错误信息
										var orderFee = bars[0].price;
										var paidFee = Number(total_fee);
										db.collection('payFailLog', function(err, collection) {
											if(err){
												console.log('error when opening payFailLog collection'); 
												}else{
													var xid = uuid.v4();
													var timestampNow = Date.parse(new Date());
													var info = {_id:xid,timestamp:timestampNow,orderFee:orderFee,paidFee:paidFee,out_trade_no:out_trade_no,paidOpenid:openid,transaction_id:transaction_id};
													collection.insert(info,function(err,data){
														if(err){
															console.log('error when inserting payFailLog'); 
															}else{
																console.log("payFailLog saved");
																}
														});
													}
											});
										}else{
											//支付金额无误，修改订单状态
											var paidFee = Number(total_fee);
											var mod = {$set:{paidFee:paidFee,paidOpenid:openid,transaction_id:transaction_id,state:3,canCheck:0,currentCourse:0,score:[]}};
											collection.update(condition,mod,function(err,data){
												if(err){
													console.log('error when modifying order state');
													}else{
														console.log("order state modified");
														}
												});
											}
									}
							}
					});
				}
		});
	}
	
/************************************************************
函数名:getAllMyReceivedOrder(db,openid,response)
参数及释义：
db							操作的数据库对象
openid						下单者的openid
response					用于返回get请求的对象体
函数作用：
    查找该openid下的所有收到的已支付订单
作者：徐思源
时间：20151013
************************************************************/
function getAllMyReceivedOrder(db,openid,response){
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {openid:openid,state:3};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								httpRet.alertMsg(response,'error','没有该订单','0');			
								}else{
									httpRet.alertMsg(response,'success','订单查询成功',bars); 
									}
							}
					});
				}
		});
	}

	
/************************************************************
函数名:refundOrder(db,id,response)
参数及释义：
db							操作的数据库对象
id							订单id
response					用于返回get请求的对象体
函数作用：
    生成预付单，回传支付链接
作者：徐思源
时间：20151013
************************************************************/
function refundOrder(db,id,response){
	//获取order信息
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {_id:id};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有此订单
								httpRet.alertMsg(response,'error','没有订单信息','0');			
								}else{
									//此处应当验证sign是否正确
									var fee = bars[0].price;
									var out_trade_no = bars[0].out_trade_no;
									var noceStr = generateNonceString(32);

									var opts = {
										out_refund_no: out_trade_no,
										out_trade_no: out_trade_no,
										total_fee: fee,
										refund_fee: fee
										};
										
									wxpay.refund(opts,function(err, result){
										var nonce_str = result.nonce_str;
										console.log("nonce_str:"+nonce_str);
										var sign = result.sign;
										//这里应该根据算法验证消息来源的正确性
										
										var obj = result;
										try{
											var signVer = mix(obj);
											}catch(e){
												console.log(e);
												}
												
										if(signVer == sign){
											console.log("sign verified");
												
											//退款结果
											var result_code = result.result_code;
											if(result_code == "SUCCESS"){
												//退款订单号
												var out_trade_no = result.out_trade_no;
												//订单总金额和退款金额
												var total_fee = result.total_fee;
												var refund_fee = result.refund_fee;
												//更新订单状态
												var mod = {$set:{state:4,refund_fee:refund_fee}};
												collection.update(condition,mod,function(err,data){
													if(err){
														httpRet.alertMsg(response,'error','获取到退款信息,更新失败',{result_code:result_code,err:err});
														}else{
															httpRet.alertMsg(response,'success','已成功退款',{result_code:result_code,refund_fee:refund_fee,out_trade_no:out_trade_no});
															}
													});	
												}
												
											if(result_code == "FAIL"){
												var err_code = receivedJson.err_code;
												console.log("err_code :"+err_code);
												var err_code_des = receivedJson.err_code_des;
												console.log("err_code_des :"+err_code_des);
												httpRet.alertMsg(response,'error',err_code_des,{result_code:result_code,err_code:err_code,err_code_des:err_code_des});
												}
												
											}else{
												console.log("sign not verified");
												console.log("sign:"+sign);
												console.log("signVer:"+signVer);
												httpRet.alertMsg(response,'error',"sign not verified",'0');
												}
										});
									}
							}				
					});
				}
		});	
	}

/************************************************************
函数名:refund(db,out,fee,refund_fee,response)
参数及释义：
db							操作的数据库对象
out						订单trans
fee
response					用于返回get请求的对象体
函数作用：
    生成预付单，回传支付链接
作者：徐思源
时间：20151013
************************************************************/
function refund(db,out,fee,refund_fee,response){
	var opts = {
		out_refund_no: out,
		out_trade_no: out,
		total_fee: fee,
		refund_fee: refund_fee
		};		
	wxpay.refund(opts,function(err, result){
		var nonce_str = result.nonce_str;
		var sign = result.sign;
		//这里应该根据算法验证消息来源的正确性

		//退款结果
		var result_code = result.result_code;
		if(result_code == "SUCCESS"){
			//退款订单号
			var out_trade_no = result.out_trade_no;
			//订单总金额和退款金额
			var total_fee = result.total_fee;
			var refund_fee = result.refund_fee;
			console.log("已退款");
			}
			
		if(result_code == "FAIL"){
			var err_code = result.err_code;
			console.log("err_code :"+err_code);
			var err_code_des = result.err_code_des;
			console.log("err_code_des :"+err_code_des);
			httpRet.alertMsg(response,'error',err_code_des,{result_code:result_code,err_code:err_code,err_code_des:err_code_des});
			}
		});
	}


/************************************************************
函数名:startCheckCourse(db,openid,id,comment,response)
参数及释义：
db							操作的数据库对象
openid						老师的openid
id							课程订单的id
response					用于返回get请求的对象体
函数作用：
    向学生发送签到确认信息
作者：徐思源
时间：20160203
************************************************************/
function startCheckCourse(db,openid,id,comment,response){
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {openid:openid,_id:id,state:3};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								httpRet.alertMsg(response,'error','订单信息有误','0');			
								}else{
									var studentOpenid = bars[0].paidOpenid;
									var	courseName = bars[0].courseName;
									var canCheck = bars[0].canCheck;
									if((typeof(canCheck)=='undefined')||(canCheck==NaN)){
										canCheck = 0;
										}
									//将该课程置为可评价数加1
									var mod = {$set:{canCheck:canCheck+1}};
									collection.update(condition,mod,function(err,data){
										if(err){
											httpRet.alertMsg(response,'error',err,'0'); 
											}else{
												//向学生发送签到确认信息
												messageHandler.sendCheckCourseMessage(db,id,openid,studentOpenid,comment,courseName);
												httpRet.alertMsg(response,'success','签到课程消息发送成功','0'); 
												}
										});
									}
							}
					});
				}
		});
	}


/************************************************************
函数名:checkCourse(db,openid,id,score,response)
参数及释义：
db							操作的数据库对象
openid						学生的openid
id							课程订单的id
score						该次评分
response					用于返回get请求的对象体
函数作用：
    学生签到并评分
作者：徐思源
时间：20160203
************************************************************/
function checkCourse(db,openid,id,score,response){
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {paidOpenid:openid,_id:id};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								httpRet.alertMsg(response,'error','课程信息有误','0');			
								}else{
									var state = bars[0].state;
									if(state == 3){
										var canCheck = bars[0].canCheck;	
										if(canCheck > 0){
											//可以评价
											var currentScore = bars[0].score;
											currentScore.push(Number(score));
											var avgScore = getAvgScore(currentScore);
											var currentCourse = bars[0].currentCourse+1;
											var totalCourse = bars[0].totalCourse;
											var process = currentCourse+'/'+totalCourse;
											var state = 3;
											if(currentCourse == totalCourse){
												//课程已结束
												state = 9;
												}
											var mod = {$set:{avgScore:avgScore,score:currentScore,canCheck:canCheck-1,currentCourse:currentCourse,state:state}};
											collection.update(condition,mod,function(err,data){
												if(err){
													httpRet.alertMsg(response,'error',err,'0'); 
													}else{
														if(currentCourse == totalCourse){
															httpRet.alertMsg(response,'success','签到评价成功,课程已结束,希望感谢您使用玩艺儿',{avgScore:avgScore,process:process});
															}else{
															httpRet.alertMsg(response,'success','签到评价成功',{avgScore:avgScore,process:process}); 	
															}
														}
												});
											}else{
												var avgScore = bars[0].avgScore;
												var currentCourse = bars[0].currentCourse;
												var totalCourse = bars[0].totalCourse;
												var process = currentCourse+'/'+totalCourse;
												httpRet.alertMsg(response,'error','签到评价失败，请老师先发起签到提醒',{avgScore:avgScore,process:process});	
												}										
										}else{
											var avgScore = bars[0].avgScore;
											var currentCourse = bars[0].currentCourse;
											var totalCourse = bars[0].totalCourse;
											var process = currentCourse+'/'+totalCourse;
											if(state == 9){
												httpRet.alertMsg(response,'error','课程已结束,请勿重复评价',{avgScore:avgScore,process:process});
												}else{
													httpRet.alertMsg(response,'error','课程状态未知,签到评价失败',{avgScore:avgScore,process:process});
													}
											}
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:getCourseInfo(db,id,response)
参数及释义：
db							操作的数据库对象
id							课程订单的id
response					用于返回get请求的对象体
函数作用：
    为签到页查询课程名称和老师姓名/为审核页提供 课程类型 授课时间 课时数 课程长度 总价 手机号码：
作者：徐思源
时间：20160203
************************************************************/
function getCourseInfo(db,id,response){
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {_id:id};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								httpRet.alertMsg(response,'error','订单信息有误','0');			
								}else{
									var teacherOpenid = bars[0].openid;
									var	courseName = bars[0].courseName;
									var courseType = bars[0].courseType;
									var day = bars[0].day;
									var time = bars[0].time;
									var totalCourse = bars[0].totalCourse;
									var courseLength = bars[0].courseLength;
									var price = bars[0].price;
									//接下来通过teacherOpenid获取老师的信息
									db.collection('user', function(err, collection) {
										if(err){
											console.log(err);
											}else{
												var condition = {openid:teacherOpenid,userType:"teacher"};
												collection.find(condition).toArray(function(err,bars){
													if(err){
														console.log(err);
														}else{
															if(bars.length == 0){
																console.log('teacher with this openid not found'); 
																}else{
																	var teacherName = bars[0].userName;
																	var teacherPhoneNum = bars[0].phoneNum;
																	httpRet.alertMsg(response,'success','查询成功',{courseName:courseName,courseType:courseType,day:day,time:time,totalCourse:totalCourse,courseLength:courseLength,price:price,teacherName:teacherName,teacherPhoneNum:teacherPhoneNum});
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
	db.collection("order", function(err, collection){
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
				console.log(condition);
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							console.log(JSON.stringify(bars));
							console.log("length:"+bars.length);
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
函数名:getMyPaidCourse(db,openid,response)
参数及释义：
db							操作的数据库对象
openid						学生的openid
response					用于返回get请求的对象体
函数作用：
    学生查找该所有已支付订单.
作者：徐思源
时间：20151013
************************************************************/
function getMyPaidCourse(db,openid,response){
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				var condition = {paidOpenid:openid};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								httpRet.alertMsg(response,'error','没有该订单','0');			
								}else{
									httpRet.alertMsg(response,'success','订单查询成功',bars); 
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:getTrend(db,openid,response)
参数及释义：
db							操作的数据库对象
openid						老师的openid
response					用于返回get请求的对象体
函数作用：
    老师查询课程表.
作者：徐思源
时间：20151013
************************************************************/
function getTrend(db,openid,response){
	db.collection('order', function(err, collection) {
		if(err){
			console.log(err); 
			}else{
				var condition = {openid:openid,state:3};
				collection.find(condition).sort({day:1,time:1}).toArray(function(err,bars){
					if(err){
						console.log(err); 
						}else{
							if(bars.length == 0){
								//没有这个订单
								console.log('没有课程');			
								}else{
									var courses = bars;
									var len = courses.length;
									var index = 0;
									var retArr = new Array(); 
									courses.map(function(crs){
											db.collection('address', function(err, collection) {
												if(err){
													console.log(err); 
													}else{
														collection.findOne({_id:crs.address1},function(err,rst){
															if(err){
																console.log(err); 
																}else{
																	var retObj = new Object();
																	//重组
																	retObj.courseName = crs.courseName;		//课程名称
																	retObj.address = rst.address;		//上课地址
																	db.collection('user', function(err, collection) {
																		if(err){
																			console.log(err);  
																			}else{
																				collection.findOne({openid:crs.openid,userType:"teacher"},function(err,rst2){
																					if(err){
																						console.log(err); 
																						}else{
																							if(rst2 == null){
																								console.log("can't find teacher openid:"+crs.openid+" for id:"+crs._id);
																								retObj.teacher = "课程中未正确标记老师";	
																								}else{
																									retObj.teacher = rst2.userName;		//老师名称
																									}
																							collection.findOne({openid:crs.paidOpenid,userType:"student"},function(err,rst3){
																								if(err){
																									console.log(err); 
																									}else{
																										if(rst3 == null){
																											console.log("can't find student openid:"+crs.paidOpenid+" for id:"+crs._id);
																											retObj.student = "课程中未正确标记学生";			//学生名称
																											retObj.phoneNum = "课程中未正确标记学生";		//学生电话
																											}else{
																												retObj.student = rst3.userName;			//学生名称
																												retObj.phoneNum = rst3.phoneNum;		//学生电话
																												}
																											retObj.day = convertDay(crs.day);		//星期
																											retObj.time = crs.time;					//时间
																											retObj.process = crs.currentCourse +"/"+crs.totalCourse;		//进度
																											retObj.orderId = crs._id;				//课程id
																											retArr.push(retObj);
																											index++;
																											if(len == index){
																												httpRet.alertMsg(response,'success','查询成功',retArr);
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
												});	
										});
									}
							}
					});
				}
		});	
	}

function convertDay(day){
	var retDay = "";
	switch(day){
		case "1":
			retDay = "星期一";
			break;
		case "2":
			retDay = "星期二";
			break;
		case "3":
			retDay = "星期三";
			break;
		case "4":
			retDay = "星期四";
			break;
		case "5":
			retDay = "星期五";
			break;
		case "6":
			retDay = "星期六";
			break;
		case "7":
			retDay = "星期日";
			break;
		default:
			retDay = "时间出错：day数据-"+day;
			break;
		}
	return retDay;
}

exports.addCourse = addCourse;
exports.delectCourse = delectCourse;
exports.getMyCourse = getMyCourse;
exports.getWaitCourse = getWaitCourse;
exports.authCourse = authCourse;
exports.unauthCourse = unauthCourse;
exports.findCourseByType = findCourseByType;
exports.createPrepayLink = createPrepayLink;
exports.updateOrderInfo = updateOrderInfo;
exports.getAllMyReceivedOrder = getAllMyReceivedOrder;
exports.getAllMyPaidOrder = getAllMyPaidOrder;
exports.startCheckCourse = startCheckCourse;
exports.checkCourse = checkCourse;
exports.getCourseInfo = getCourseInfo;
exports.findInterestCourse = findInterestCourse;
exports.getMyPaidCourse = getMyPaidCourse;
exports.getTrend = getTrend;

exports.getOrderInfo = getOrderInfo;
exports.getAllMyOrder = getAllMyOrder;
exports.getAllMyUnpaidOrder = getAllMyUnpaidOrder;
exports.getAllMyRefundOrder = getAllMyRefundOrder;
exports.refundOrder = refundOrder;
exports.refund = refund;
exports.mix = mix;


function getSign(jsonMsg){
	var privatePem = fs.readFileSync('./cert/key.pem');
	var key = privatePem.toString();
	console.log("encrypting...");
	var signingData = jsonMsg.command+jsonMsg.out_trade_no+jsonMsg.noceStr;
	var rsa = crypto.createSign('RSA-SHA256');
	rsa.update(signingData);
	var signature = rsa.sign(key,'hex');
	return signature;	
}

function getAvgScore(scoreArray){
	if(typeof(scoreArray)=='object'){
		var sum = 0;
		var count = 0;
		for(var i in scoreArray){
			if(typeof(scoreArray[i])=='number'){
				sum += scoreArray[i];
				count++;
				}else{
					console.log('the '+i+'th element is not a number:'+typeof(scoreArray[i]));
					}
			}
		if(count>0){
			console.log('sum:'+sum);
			console.log('count:'+count);
			return sum/count;
			}else{
				console.log('score length is 0');
				return 0;
				}
		}else{
			console.log('score is not an array');
			return 0;
			}
	}


function generateNonceString(length){
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var maxPos = chars.length;
	var noceStr = "";
	for (var i = 0; i < (length || 32); i++) {
		noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
		}
	return noceStr;
	}
	
function mix(param){
	var querystring = Object.keys(param).filter(function(key){
		return param[key] !== undefined && param[key] !== '' && ['pfx', 'partner_key', 'sign', 'key'].indexOf(key)<0;
	}).sort().map(function(key){
		var ret = key + '=' + param[key];
		return ret;
	}).join("&") + "&key=" + partner_key;	
	var retSign = md5(querystring).toUpperCase();
	return retSign;
	}