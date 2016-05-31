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

var wxpay = WXPay({
    appid: 'wx6585c007ff6e5490',
    mch_id: '1298263001',
    partner_key: '923f8c19733d208b8de55daf57a6278a', //微信商户平台API密钥
    pfx: fs.readFileSync('./cert/apiclient_cert.p12'), //微信商户平台证书
});


var partner_key = '923f8c19733d208b8de55daf57a6278a';

/************************************************************
函数名:addCourseOrder(db,id,openid,response)
参数及释义：
db							操作的数据库对象
courseId							course id
openid						下单者openid
response					用于返回get请求的对象体
函数作用：
    为课程下单
作者：徐思源
时间：20151013
************************************************************/
function addCourseOrder(db,courseId,openid,response){
	//获取Item信息
	db.collection('course', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该商品是否存在
				var condition = {_id:courseId,state:2};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有此商品
								httpRet.alertMsg(response,'error','没有指定教学信息或该教学未通过审核','0');			
								}else{
									var courseName = bars[0].courseName;
									var fee = bars[0].price;
									var providerOpenid = bars[0].openid;
									var totalCourse = bars[0].totalCourse;
									var address1 = bars[0].address1;
									var address2 = bars[0].address2;
									db.collection('order', function(err, collection) {
										if(err){
											httpRet.alertMsg(response,'error',err,'0'); 
											}else{
												//未支付订单的state为0
												var condition = {openid:openid,state:0,type:"course"};
												collection.find(condition).toArray(function(err,bars){
													if(err){
														httpRet.alertMsg(response,'error',err,'0'); 
														}else{
															if(bars.length > 30){
																httpRet.alertMsg(response,'error','未支付订单超过30个，请支付或删除未支付订单','0'); 
																}else{
																	var xid = uuid.v4();
																	var timestampNow = Date.parse(new Date());
																	var out_trade_no = (new Date()).getTime()+Math.random().toString().substr(2,10);
																	var order = {_id:xid,
																				type:"course",
																				courseId:courseId,
																				openid:openid,
																				courseName:courseName,
																				providerOpenid:providerOpenid,
																				fee:fee,
																				out_trade_no:out_trade_no,
																				address1:address1,
																				address2:address2,
																				state:0,
																				totalCourse:totalCourse
																				};
																	collection.insert(order,function(err,data){
																		if(err){
																			httpRet.alertMsg(response,'error',err,'0');
																			}else{
																				httpRet.alertMsg(response,'success','下单成功',out_trade_no); 
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
				var condition = {openid:openid,state:0};
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
				var condition = {openid:openid,state:1};
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
    查找该openid下的所有已支付订单
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
函数名:createPrepayLink(db,orderId,response)
参数及释义：
db							操作的数据库对象
orderId						订单id
response					用于返回get请求的对象体
函数作用：
    生成预付单，回传支付链接
作者：徐思源
时间：20151013
************************************************************/
function createPrepayLink(db,orderId,response){
	//获取order信息
	db.collection('order', function(err, collection) {
		if(err){
			httpRet.alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {_id:orderId};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有此订单
								httpRet.alertMsg(response,'error','没有订单信息','0');			
								}else{
									var type = bars[0].type;
									if(type == "course"){
										var itemName = bars[0].courseName;
										var itemId = bars[0].courseId;
										}
									
									var fee = bars[0].fee;
									var out_trade_no = bars[0].out_trade_no;
									var noceStr = generateNonceString(32);
																
									//这里向weixin发送post请求...
									
									var opts = {
										body: itemName,
										out_trade_no: out_trade_no,
										total_fee: fee,
										spbill_create_ip: '119.29.92.190',
										notify_url: 'http://119.29.92.190:6002',
										trade_type: 'NATIVE',
										product_id: itemId
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
												console.log("sign ot verified");
												}										
										});	
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
									//验证支付金额是否正确
									if(bars[0].fee != Number(total_fee)){
										console.log("order fee:"+bars[0].fee+" does not match to paid total_fee:"+total_fee);
										//记录支付错误信息
										var orderFee = bars[0].fee;
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
											var mod = {$set:{paidFee:paidFee,paidOpenid:openid,transaction_id:transaction_id,state:1,currentCourse:0,score:[]}};
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
				var condition = {providerOpenid:openid,state:1};
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
									var fee = bars[0].fee;
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
	
	
exports.addCourseOrder = addCourseOrder;
exports.getOrderInfo = getOrderInfo;
exports.getAllMyOrder = getAllMyOrder;
exports.getAllMyUnpaidOrder = getAllMyUnpaidOrder;
exports.getAllMyPaidOrder = getAllMyPaidOrder;
exports.getAllMyRefundOrder = getAllMyRefundOrder;
exports.createPrepayLink = createPrepayLink;
exports.updateOrderInfo = updateOrderInfo;
exports.getAllMyReceivedOrder = getAllMyReceivedOrder;
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