var uuid = require('uuid');
var http = require('http');
var https = require('https');
var crypto = require('crypto');
var str_tmp ="";
var serverIP = "119.29.92.190";
var fs = require('fs');
var httpRet = require('./httpRet');

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
函数名：getOpenid(db,code,response)
参数及释义：
db							操作的数据库对象
code						web端传递过来,oauth2获取的
response					用于返回get请求的对象体
函数作用：
    获取openid,避免微信回传信息跨域问题。
作者：徐思源
时间：20150901
************************************************************/
function getOpenid(db,code,response){
	//取得appid和secret
	db.collection("api", function(err, collection) {
		if(err){
			console.log("error:"+err);
			alertMsg(response,'error',err,'0');
			}else{
				var condition = {name:"wx"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("can't find data");
								}else{
									var appid = bars[0].appid;
									var secret = bars[0].secret;
									var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid="+appid+"&secret="+secret+"&code="+code+"&grant_type=authorization_code"
									https.get(url, function(res){
										var openid_tmp ="";
										res.on('data', function (chunk){
											openid_tmp+=chunk;
											if(openid_tmp.slice(-1)=='}'){
												console.log("openid_tmp : "+openid_tmp);
												var json_tmp =JSON.parse(openid_tmp);
												if(typeof(json_tmp.access_token)!="undefined"){
													//成功获取access_token,存储
													var access_token = json_tmp.access_token;
													var openid = json_tmp.openid;
													console.log(openid);
													var url = "https://api.weixin.qq.com/sns/userinfo?access_token="+access_token+"&openid="+openid;
													https.get(url, function(res){
														var datatemp ="";
														res.on('data', function (chunk){
															datatemp+=chunk;
															if(datatemp.slice(-1)=='}'){
																console.log("datatemp : "+datatemp);
																var userInfo =JSON.parse(datatemp);
																var json_ret = {openid:openid,userInfo:userInfo};
																console.log(json_ret);
																alertMsg(response,'success','openid got',json_ret);
																}
															});
														});
													}else{
														if(typeof(json_tmp.errmsg)!="undefined"){
															console.log(json_tmp.errmsg);
															}else{
																console.log("unknown error occurs when trying to get accessToken.");
																}
														}
												}
											});
										}).on('error', function(e) {
											console.log("Got error: " + e.message);
											});											
									}							
							}					
					});
				}
		});
	}	

/************************************************************
函数名：getSignPackage(db,pathname,response)
参数及释义：
db							操作的数据库对象
pathname					发起请求的页面主机域名和地址,等同于php中的
"http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]"，用于jsapi的数字签名
response					用于返回get请求的对象体
函数作用：
    获取openid,避免微信回传信息跨域问题。
作者：徐思源
时间：20150901
************************************************************/
function getSignPackage(db,pathname,response){
	//取得appid和JsApiTicket
	db.collection("api", function(err, collection) {
		if(err){
			console.log("error:"+err);
			alertMsg(response,'error',err,'0');
			}else{
				var condition = {name:"wx"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("can't find data");
								}else{
									var JATExpiresTimestamp = bars[0].jsApiTicket;
									var timestampNow = Date.parse(new Date());
									if (JATExpiresTimestamp < timestampNow){
										console.log("jsApiTicket expired, regenerate...");
										getJsApiTicket(db,function(JAT){
											getSignPackage(db,pathname,response);
											});
										}else{
											//生成签名
											var jsApiTicket = bars[0].jsApiTicket;
											console.log("jsApiTicket = "+jsApiTicket);
											var appid = bars[0].appid;
											var timestampNow = Date.parse(new Date());
											var timestamp = timestampNow/1000;
											var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
											var nonceStr = "";
											for (var i = 0;i<16;i++){
												nonceStr += chars[Math.floor(Math.random()*chars.length)];
											}
											var string = "jsapi_ticket="+jsApiTicket+"&noncestr="+nonceStr+"&timestamp="+timestamp+"&url="+pathname;
											
											//使用SHA1 算法算出签名
											var shasum = crypto.createHash('sha1');
											shasum.update(string);
											var signature = shasum.digest('hex');
											
											//构造返回用signPackage
											var json_signPackage = {appId:appid,nonceStr:nonceStr,timestamp:timestamp,url:pathname,signature:signature,rawString:string};
											console.log(json_signPackage);
											alertMsg(response,'success','signPackage got',json_signPackage);												
												
											}										
									}							
							}					
					});
				}
		});
	}
	

	
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
函数名：initWXApi(db,response)
参数及释义：
db							操作的数据库对象
response					用于返回get请求的对象体
函数作用：
    初始化api数据集中wx项                                                                                                                                                                                                                                                                                                                                                                                                                     
作者：徐思源
时间：20150730
************************************************************/		
function initWXApi(db,response){
	db.collection("api", function(err, collection){
		if(err){
			console.log("err:"+err);
			alertMsg(response,'error',err,'0');
			}else{			
				var condition = {name:"wx"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("err:"+err);
						alertMsg(response,'error',err,'0');				
						}else{
							if(bars.length == 0){
								collection.insert({name:"wx",appid:"",secret:"",access_token:"",timestamp:0});
								alertMsg(response,'success','wx api initialized.','0');
								}else{
									console.log("wx already exists.");
									alertMsg(response,'error','wx already exists.','0');								
									}
							}
					});
				}		
		});
}	
	
	
/************************************************************
函数名：modAppid(db,appid,response)
参数及释义：
db							操作的数据库对象
appid						微信的appid
response					用于返回get请求的对象体
函数作用：
    修改数据库api中的appid
作者：徐思源
时间：20150730
************************************************************/	
function modAppid(db,appid,response){
	db.collection("api", function(err, collection){
		if(err){
			console.log("err:"+err);
			alertMsg(response,'error',err,'0');
			}else{
				var condition = {name:"wx"};
				var mod ={$set:{appid:appid}};
				collection.update(condition,mod,function(err,data){
					if(err){
						console.log("err:"+err);
						alertMsg(response,'error',err,'0');
						}else{
							console.log("mod appid success.");
							alertMsg(response,'success','mod appid success','0');
							}
				});
			}
	});
}	

/************************************************************
函数名：modSecret(db,secret,response)
参数及释义：
db							操作的数据库对象
secret						微信的secret
response					用于返回get请求的对象体
函数作用：
    修改数据库api中的secret
作者：徐思源
时间：20150730
************************************************************/		
function modSecret(db,secret,response){
	db.collection("api", function(err, collection){
		if(err){
			console.log("err:"+err);
			alertMsg(response,'error',err,'0');
			}else{
				var condition = {name:"wx"};
				var mod ={$set:{secret:secret}};
				collection.update(condition,mod,function(err,data){
					if(err){
						console.log("err:"+err);
						alertMsg(response,'error',err,'0');
						}else{
							console.log("mod secret success.");
							alertMsg(response,'success','mod secret success','0');
							}
				});
			}
	});	
}	

/************************************************************
函数名：needAT(db,response)
参数及释义：
db							操作的数据库对象
response					用于返回get请求的对象体
函数作用：
    修改数据库api中的secret
作者：徐思源
时间：20150810
************************************************************/	
function needAT(db,response){
	db.collection("api", function(err, collection){
		if(err){
			console.log("err:"+err);
			alertMsg(response,'error',err,'0');
			}else{
				var condition = {name:"wx"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("err:"+err);
						alertMsg(response,'error',err,'0');
						}else{
							if(bars.length != 0){
								var AT = bars[0].access_token;
								var retjson = {access_token:AT};
								var ret = JSON.stringify(retjson);
								alertMsg(response,'success','accessToken got',ret);
								}
							}
				});
			}
	});		
	}

	
/************************************************************
函数名：getJsApiTicket(db,callback)
参数及释义：
db							操作的数据库对象
response					用于返回get请求的对象体
函数作用：
    获取jsapiticket
作者：徐思源
时间：20150810
************************************************************/	
function getJsApiTicket(db,callback){
	//查询accessToken和timestamp
	db.collection("api", function(err, collection){
		if(err){
			console.log("error:"+err);
			}else{
				collection.find({name:"wx"}).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);				
						}else{
							if(bars.length == 0){
								var word = "系统api未初始化，请后台使用初始化配置系统appid和secret";
								console.log(word);								
								}else{
									var access_token = bars[0].access_token;
									
									//获取jsapiticket
									var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token="+access_token;
									https.get(url, function(res){
										var jat_tmp ="";
										res.on('data', function (chunk){
											jat_tmp+=chunk;
											if(jat_tmp.slice(-1)=='}'){
												console.log("jat_tmp : "+jat_tmp);
												var json_tmp =JSON.parse(jat_tmp);
												if(typeof(json_tmp.ticket)!="undefined"){
													//成功获取ticket,存储
													var jsApiTicket = json_tmp.ticket;
													var JATExpiresTimestamp = Date.parse(new Date()) + 3000000;
													console.log(jsApiTicket);
													var mod = {$set:{jsApiTicket:jsApiTicket,JATExpiresTimestamp:JATExpiresTimestamp}};
													var jat_json = {jsApiTicket:jsApiTicket};
													fs.writeFileSync('D:/jsApiTicket.json',JSON.stringify(jat_json),'utf-8');
													collection.update({name:"wx"},mod,function(err,data){
														if(err){
															console.log("err:"+err);
															}else{
																console.log("saved");
																callback.call(this,jsApiTicket);
																}
														});
													}else if(json_tmp.errcode == 40001){
														getAccessToken(db,function(AT){
															getJsApiTicket(db);
															});
														if(typeof(json_tmp.errmsg)!="undefined"){
															console.log(json_tmp.errmsg);
															}else{
																console.log("unknown error occurs when trying to get accessToken.");
																}
														}
												}
											});
										}).on('error', function(e) {
											console.log("Got error: " + e.message);
											});														
									}
							}
					});
				}
		});	
	}	

	
	
	
/************************************************************
函数名:getAccessToken(db,callback)
参数及释义：
db							操作的数据库对象
response					用于返回get请求的对象体
函数作用：
    获取accessToken
作者：徐思源
时间：20150810
************************************************************/
function getAccessToken(db,callback){
	db.collection("api", function(err, collection){
		if(err){
			console.log("error:"+err);
			}else{
				//获取appid和secret
				collection.find({name:"wx"}).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);				
						}else{
							if(bars.length != 0){
								var appid = bars[0].appid;
								var secret = bars[0].secret;
								var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+appid+"&secret="+secret;
								//向微信服务器发送get请求
								https.get(url, function(res){
									var access_tmp ="";
									res.on('data', function (chunk){
										access_tmp+=chunk;
										if(access_tmp.slice(-1)=='}'){
											console.log("access_tmp : "+access_tmp);
											var json_tmp =JSON.parse(access_tmp);
											if(typeof(json_tmp.access_token)!="undefined"){
												//成功获取access_token,存储
												var access_token = json_tmp.access_token;
												var timestampNow = Date.parse(new Date());
												var mod = {$set:{access_token:access_token,timestamp:timestampNow}};
												var fs_json = {accessToken:access_token};
												fs.writeFileSync('D:/accessToken.json',JSON.stringify(fs_json),'utf-8');
												collection.update({name:"wx"},mod,function(err,data){
													if(err){
														console.log("error:"+err);														
														}else{
															console.log("successfully get AccessToken.");
															callback.call(this,access_token);
															}
													});
												}else{
													if(typeof(json_tmp.errmsg)!="undefined"){
														console.log(json_tmp.errmsg);
														}else{
															console.log("unknown error occurs when trying to get accessToken.");
															}
													}
											}
										});
									}).on('error', function(e) {
										console.log("Got error: " + e.message);
										});										
								}else{
									console.log("wx is not initiated, please use initWXApi command.");
									}
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


exports.writeResponse = writeResponse;
exports.initWXApi = initWXApi;
exports.modAppid = modAppid;
exports.modSecret = modSecret;
exports.getAccessToken = getAccessToken;
exports.needAT = needAT;
exports.getOpenid = getOpenid;
exports.getJsApiTicket = getJsApiTicket;
exports.getSignPackage = getSignPackage;
exports.addCheckPhone = addCheckPhone;//