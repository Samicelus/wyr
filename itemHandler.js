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

/************************************************************
函数名：writeResponse(response,content)
参数及释义：
response					用于返回get请求的对象体
content						返回的内容文本
函数作用：
    用于其他函数响应返回get请求，设置header为
"Access-Control-Allow-Origin":"*"以解决跨域问题。
作者：徐思源
时间：20150722
************************************************************/	
function writeResponse(response,content){
	response.writeHead(200,{"Content-Type":"text/plain; charset=utf-8","Access-Control-Allow-Origin":"*","Cache-Control":"no-cache, no-store, must-revalidate","Pragma":"no-cache","Expires":"0"});
	response.write(content);
	response.end();
	}


/************************************************************
函数名：alertMsg(,result,msg,data)
参数及释义：
db							操作的数据库对象
response					用于返回get请求的对象体
函数作用：
   
作者：徐思源
时间：20151013
************************************************************/
function alertMsg(response,result,msg,data){
	console.log(msg);
	var ret = JSON.stringify({result:result,msg:msg,data:data});
	writeResponse(response,ret); 	
}

/************************************************************
函数名：addItem(db,itemName,description,fee,itemType,provider，response)
参数及释义：
db							操作的数据库对象
itemName					商品名称
description					商品描述
fee							单价
itemType					商品类型
provider					提供者
response					用于返回get请求的对象体
函数作用：
    添加商品
作者：徐思源
时间：20151013
************************************************************/
function addItem(db,itemName,description,fee,itemType,provider,response){
	db.collection('item', function(err, collection) {
		if(err){
			alertMsg(response,'error',err,'0'); 
			}else{
				//检查该商品是否存在
				var condition = {itemName:itemName,provider:provider};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length != 0){
								//商品已存在，不可以建立
								alertMsg(response,'error','商品名称已存在','0');			
								}else{
									//商品未注册，可以注册
									var xid = uuid.v4();
									var timestampNow = Date.parse(new Date());
									collection.insert({
										_id: xid,
										itemName: itemName,
										description: description,
										fee: Number(fee),
										itemType: itemType,
										provider: provider,
										timestamp: timestampNow
									}, function(err, data){
										if (data){
											alertMsg(response,'success','商品添加成功',itemName); 
											} else {
												alertMsg(response,'error',err,'0'); 
												}																
										});									
									}
							}				
					});
				}
		});	

	}

/************************************************************
函数名:findItemByNameAndProvider(db,itemName,provider,response)
参数及释义：
db							操作的数据库对象
itemName					商品名称
provider					提供者
response					用于返回get请求的对象体
函数作用：
    精确查找商品
作者：徐思源
时间：20151013
************************************************************/
function findItemByNameAndProvider(db,itemName,provider,response){
	db.collection('item', function(err, collection) {
		if(err){
			alertMsg(response,'error',err,'0'); 
			}else{
				//检查该商品是否存在
				var condition = {itemName:itemName,provider:provider};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//该提供者没有此商品
								alertMsg(response,'error','该提供者没有此商品','0');			
								}else{
									alertMsg(response,'success','商品查询成功',bars); 
									}
							}				
					});
				}
		});	

	}	

/************************************************************
函数名:findItemByName(db,itemName,response)
参数及释义：
db							操作的数据库对象
itemName					商品名称
response					用于返回get请求的对象体
函数作用：
    查找提供者的所有商品
作者：徐思源
时间：20151013
************************************************************/
function findItemByName(db,itemName,response){
	db.collection('item', function(err, collection) {
		if(err){
			alertMsg(response,'error',err,'0'); 
			}else{
				//检查该商品是否存在
				var condition = {itemName:{$regex:itemName}};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个商品
								alertMsg(response,'error','该提供者没有商品','0');			
								}else{
									alertMsg(response,'success','商品查询成功',bars); 
									}
							}				
					});
				}
		});	

	}		
	
/************************************************************
函数名:findItemByProvider(db,provider,response)
参数及释义：
db							操作的数据库对象
provider					提供者
response					用于返回get请求的对象体
函数作用：
    查找提供者的所有商品
作者：徐思源
时间：20151013
************************************************************/
function findItemByProvider(db,provider,response){
	db.collection('item', function(err, collection) {
		if(err){
			alertMsg(response,'error',err,'0'); 
			}else{
				//检查该商品是否存在
				var condition = {provider:{$regex:provider}};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个商品
								alertMsg(response,'error','该提供者没有商品','0');			
								}else{
									alertMsg(response,'success','商品查询成功',bars); 
									}
							}				
					});
				}
		});	

	}	
	

/************************************************************
函数名:deleteItem(db,id,response)
参数及释义：
db							操作的数据库对象
id							商品id
response					用于返回get请求的对象体
函数作用：
    删除商品
作者：徐思源
时间：20151013
************************************************************/
function deleteItem(db,id,response){
	db.collection('item', function(err, collection) {
		if(err){
			alertMsg(response,'error',err,'0'); 
			}else{
				var condition = {_id:id};
				collection.remove(condition,function(err,data){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							alertMsg(response,'success','商品删除成功',data); 
							}				
					});
				}
		});	
	}	

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
			alertMsg(response,'error',err,'0'); 
			}else{
				//检查该商品是否存在
				var condition = {_id:courseId};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有此商品
								alertMsg(response,'error','没有指定商品信息','0');			
								}else{
									var courseName = bars[0].courseName;
									var fee = bars[0].price;
									var providerOpenid = bars[0].openid;
									db.collection('order', function(err, collection) {
										if(err){
											alertMsg(response,'error',err,'0'); 
											}else{
												//未支付订单的state为0
												var condition = {openid:openid,state:0,type:"course"};
												collection.find(condition).toArray(function(err,bars){
													if(err){
														alertMsg(response,'error',err,'0'); 
														}else{
															if(bars.length > 30){
																alertMsg(response,'error','未支付订单超过30个，请支付或删除未支付订单','0'); 
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
																				state:0
																				};
																	collection.insert(order,function(err,data){
																		if(err){
																			alertMsg(response,'error',err,'0');
																			}else{
																				alertMsg(response,'success','下单成功',out_trade_no); 
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
			alertMsg(response,'error',err,'0'); 
			}else{
				//检查该商品是否存在
				var condition = {_id:id};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个商品
								alertMsg(response,'error','没有该订单','0');			
								}else{
									alertMsg(response,'success','订单查询成功',bars); 
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
			alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {openid:openid};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								alertMsg(response,'error','没有该订单','0');			
								}else{
									alertMsg(response,'success','订单查询成功',bars); 
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
			alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {openid:openid,state:0};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								alertMsg(response,'error','没有该订单','0');			
								}else{
									alertMsg(response,'success','订单查询成功',bars); 
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
			alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {openid:openid,state:1};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有这个订单
								alertMsg(response,'error','没有该订单','0');			
								}else{
									alertMsg(response,'success','订单查询成功',bars); 
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
			alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {_id:orderId};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有此订单
								alertMsg(response,'error','没有订单信息','0');			
								}else{
									var itemName = bars[0].itemName;
									var fee = bars[0].fee;
									var itemId = bars[0].itemId;
									var out_trade_no = bars[0].out_trade_no;
									var noceStr = generateNonceString(32);
									
									var jsonMsg = {command:"createUnifiedOrder",itemName:itemName,fee:fee,itemId:itemId,out_trade_no:out_trade_no,noceStr:noceStr};			
									jsonMsg.sign = getSign(jsonMsg);
									
									
									var postData = querystring.stringify({'data':JSON.stringify(jsonMsg)});									
									//这里向203.195.161.11发送post请求...
									sendPostDataCallback(postData,function(receivedData){
										//console.log("received data:"+receivedData);
										var receivedJson = JSON.parse(receivedData);
										var nonce_str = receivedJson.nonce_str;
										var sign = receivedJson.sign;
										//这里应该根据算法验证消息来源的正确性
										
										
										var result_code = receivedJson.result_code;
										
										if(result_code == "SUCCESS"){
											var code_url = receivedJson.code_url;
											console.log("code_url :"+code_url);
											console.log("saving and sending code_url back to user...");
											//存储支付链接到订单
											var mod = {$set:{prepayLink:code_url}};
											collection.update(condition,mod,function(err,data){
												if(err){
													alertMsg(response,'error','获取到支付链接,存储失败',{result_code:result_code,code_url:code_url,err:err});
													}else{
														alertMsg(response,'success','获取到支付链接',{result_code:result_code,code_url:code_url});
														}
												});
											}
											
										if(result_code == "FAIL"){
											var err_code = receivedJson.err_code;
											console.log("err_code :"+err_code);
											var err_code_des = receivedJson.err_code_des;
											console.log("err_code_des :"+err_code_des);
											alertMsg(response,'error',err_code_des,{result_code:result_code,err_code:err_code,err_code_des:err_code_des});
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
										db.collection('order', function(err, collection) {
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
											var mod = {$set:{paidFee:paidFee,paidOpenid:openid,transaction_id:transaction_id,state:1}};
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
			alertMsg(response,'error',err,'0'); 
			}else{
				//检查该订单是否存在
				var condition = {_id:id};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								//没有此订单
								alertMsg(response,'error','没有订单信息','0');			
								}else{
									//此处应当验证sign是否正确
									var fee = bars[0].fee;
									var out_trade_no = bars[0].out_trade_no;
									var noceStr = generateNonceString(32);
									
									var jsonMsg = {command:"refund",fee:fee,out_trade_no:out_trade_no,noceStr:noceStr};
									jsonMsg.sign = getSign(jsonMsg);
									var postData = querystring.stringify({'data':JSON.stringify(jsonMsg)});									
									//这里向203.195.161.11发送post请求...
									
									sendPostDataCallback(postData,function(receivedData){
										//console.log("received data:"+receivedData);
										var receivedJson = JSON.parse(receivedData);
										var nonce_str = receivedJson.nonce_str;
										var sign = receivedJson.sign;
										//这里应该根据算法验证消息来源的正确性

										var result_code = receivedJson.result_code;					
										if(result_code == "SUCCESS"){
											//退款结果
											var result_code = receivedJson.result_code;
											if(result_code == "SUCCESS"){
												//退款订单号
												var out_trade_no = receivedJson.out_trade_no;
												//订单总金额和退款金额
												var total_fee = receivedJson.total_fee;
												var refund_fee = receivedJson.refund_fee;
												//更新订单状态
												var mod = {$set:{state:4,refund_fee:refund_fee}};
												collection.update(condition,mod,function(err,data){
													if(err){
														alertMsg(response,'error','获取到退款信息,更新失败',{result_code:result_code,err:err});
														}else{
															alertMsg(response,'success','已成功退款',{result_code:result_code,refund_fee:refund_fee,out_trade_no:out_trade_no});
															}
													});												
												
												}
											
											if(result_code == "FAIL"){
												//错误信息描述
												var err_code_des = receivedJson.err_code_des;	
												}
											
											}
											
										if(result_code == "FAIL"){
											var err_code = receivedJson.err_code;
											console.log("err_code :"+err_code);
											var err_code_des = receivedJson.err_code_des;
											console.log("err_code_des :"+err_code_des);
											alertMsg(response,'error',err_code_des,{result_code:result_code,err_code:err_code,err_code_des:err_code_des});
											}										
										});
									}
							}				
					});
				}
		});	
	}	
exports.writeResponse = writeResponse;

exports.addItem = addItem;
exports.findItemByNameAndProvider = findItemByNameAndProvider;
exports.findItemByName = findItemByName;
exports.findItemByProvider = findItemByProvider;
exports.deleteItem = deleteItem;
exports.addOrder = addOrder;
exports.getOrderInfo = getOrderInfo;
exports.getAllMyOrder = getAllMyOrder;
exports.getAllMyUnpaidOrder = getAllMyUnpaidOrder;
exports.getAllMyPaidOrder = getAllMyPaidOrder;
exports.createPrepayLink = createPrepayLink;
exports.updateOrderInfo = updateOrderInfo;
exports.refundOrder = refundOrder;



function sendPostDataCallback(postData,callback){
	console.log("sending msg to "+serverIP);
	var options = {
		hostname: serverIP,
		port: serverPort,
		path: '',
		method: 'POST',
		headers: {'Content-Type': 'application/x-www-form-urlencoded','Content-Length': postData.length}
		};
	var req = http.request(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  var receivedData = "";
	  res.on('data', function (chunk) {
		//console.log('BODY: ' + chunk);
		receivedData += chunk;
	  });
	  res.on('end', function() {
		console.log('No more data in response.');
		//console.log(receivedData);
		callback(receivedData);
		receivedData = "";
	  });
	});
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	// write data to request body
	req.write(postData);
	req.end();	
}

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