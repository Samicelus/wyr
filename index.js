var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var http = require('http');
var url = require('url');
var uuid = require('uuid');
var moment = require('moment');
var apiHandler= require('./apiHandler');
var addressHandler= require('./addressHandler');
var teacherHandler= require('./teacherHandler');
var studentHandler= require('./studentHandler');
var courseHandler= require('./courseHandler');
var merchantHandler= require('./merchantHandler');
var shopHandler= require('./shopHandler');
var youkuHandler= require('./youkuHandler');
var orderHandler= require('./orderHandler');
var messageHandler = require('./messageHandler');
var courseTypeHandler =require('./courseTypeHandler');
var trendHandler =require('./trendHandler');

var md5 = require('md5');
var querystring = require("querystring");
var schedule = require("node-schedule");
var fs = require('fs');
var processHandler = require('./processHandler');
var httpRet = require('./httpRet')
//xml2js相关类
var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray:false});
var builder = new xml2js.Builder({rootName:'xml',headless:true,cdata:true});


fs.readFile('./config.json', function (err, data) {
	if (err) throw err;
	try{
		var obj = JSON.parse(data);
		}catch(e){
			console.log(e);
			}
			
	if(typeof(obj)!= "undefined"){
		var mongodbPort = obj.mongodbPort;
		var httpPort = obj.httpPort;
		var weixinNotifyPort = JSON.parse(data).weixinNotifyPort;

		//连接本地Mongodb数据库， 数据库端口27017，连接池大小10
		var mongodbServer = new mongodb.Server('localhost', mongodbPort, { auto_reconnect: true, poolSize: 10 });
		//连接的数据库名称为userAuth 相当于命令行 use userAuth
		var db = new mongodb.Db('Data', mongodbServer);


		/* 开启数据库 */
		db.open(function(){

		//xml2js处理结果
		parser.addListener('end', function(result) {

			if(typeof(result)!='undefined'){
				if(typeof(result.xml)!='undefined'){
					console.log(JSON.stringify(result));
					var obj = result.xml;
					try{
						var total_fee = result.xml.total_fee;
						var nonce_str = result.xml.nonce_str;
						var openid = result.xml.openid;
						var out_trade_no = result.xml.out_trade_no;
						var sign = result.xml.sign;
						var transaction_id = result.xml.transaction_id;
						var signVer = orderHandler.mix(obj);
						}catch(e){
							console.log(e);
							}
					if(signVer == sign){
						console.log("signature verified");
						console.log("支付消息: openid 为: "+openid+" 的用户为订单号为:"+out_trade_no+" 的商品支付了总共: "+(Number(total_fee)/100)+" 元.");
						console.log("支付消息签名: "+sign);
						console.log("微信支付交易单号: "+transaction_id);
						//更新订单支付状态
						console.log("start update orderInfo");
						orderHandler.updateOrderInfo(db,out_trade_no,openid,transaction_id,total_fee);
						var url = "";
						messageHandler.sendOrderMessage(db,out_trade_no);
						}else{
							console.log("signature not verified");
							}		
					}else{console.log("result.xml type = undefined");}	
				}else{console.log("result type = undefined");}
			});

			
			var rule = new schedule.RecurrenceRule();
			rule.minute  = 28;
			var j = schedule.scheduleJob(rule, function(){
				apiHandler.getAccessToken(db,function(AT){
					console.log("this hour's new accessToken got:"+AT);
					});
				apiHandler.getJsApiTicket(db,function(JAT){
					console.log("this hour's new JsApiTicket got:"+JAT);
					});
				});
			
			
			http.createServer(function (request, response) {
					
					request.setEncoding("utf8");
					
					var postData = "";
					
					request.addListener("data", function(postDataChunk) {
						postData += postDataChunk;
						console.log("Received POST data chunk '"+ postDataChunk + "'.");
						});
						
					request.addListener("end", function() {
						
						//处理postData
						var data = querystring.parse(postData).data;
						if(typeof(data)!= "undefined"){
							
							try{
								var obj = JSON.parse(data);
								}catch(e){
									console.log(e);
									}
									
							if(typeof(obj)!= "undefined"){
								var command = obj.command;
								console.log("command:"+command);

					
									//获取用户openid
									if(command == "getOpenid"){
										if(typeof(obj.code)!='undefined'){
											var code = obj.code;
											try {
												apiHandler.getOpenid(db,code,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}											
											}else{
												var ret = JSON.stringify({result:'error',msg:'code is not defined'});
												httpRet.writeResponse(response,ret);									
												}			
										}
									
									//获取signPackage
									if(command == "getSignPackage"){
										if(typeof(obj.pathname)!='undefined'){
											var pathname = obj.pathname;
											try {
												apiHandler.getSignPackage(db,pathname,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}											
											}else{
												var ret = JSON.stringify({result:'error',msg:'pathname is not defined'});
												httpRet.writeResponse(response,ret);
												}						
										}			
								
									//获取AccessToken
									if(command == "needAT"){
										try {
											apiHandler.needAT(db,response);
											}catch(err){
												var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
												processHandler.errorLog(db,errorMsg,response);
												}
										}
									
									
									//api相关,初始化api数据集中wx项（后台）
									if(command == "initWXApi"){
										try {
											apiHandler.initWXApi(db,response);
											}catch(err){
												var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
												processHandler.errorLog(db,errorMsg,response);
												}
										}
									
									//api相关,修改appid（后台）
									if(command == "modAppid"){
										if(typeof(obj.appid)!='undefined'){
											var appid = obj.appid;
											try {
												apiHandler.modAppid(db,appid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'appid is not defined'});
												httpRet.writeResponse(response,ret);
												}					
										}
									
									//api相关,修改secret（后台）
									if(command == "modSecret"){
										if(typeof(obj.secret)!='undefined'){
											var secret = obj.secret;
											try {
												apiHandler.modSecret(db,secret,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'secret is not defined'});
												httpRet.writeResponse(response,ret);
												}					
									}
									
									//api相关,获取AccessToken（后台）
									if(command == "getAccessToken"){
										apiHandler.getAccessToken(db,function(AT){
											var ret = JSON.stringify({result:'success',msg:"new AT :"+AT});
											httpRet.writeResponse(response,ret);
											});				
										}
									
									//api相关,获取JsApiTicket（后台）
									if(command == "getJsApiTicket"){
										apiHandler.getJsApiTicket(db,function(JAT){
											var ret = JSON.stringify({result:'success',msg:"new JAT :"+JAT});
											httpRet.writeResponse(response,ret);
											});
										}
										
									//注册学生
									if(command == "addStudent"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.phoneNum)!='undefined'){
												var phoneNum = obj.phoneNum;								
												if(typeof(obj.authCode)!='undefined'){
													var authCode = obj.authCode;
													try {
														studentHandler.addStudent(db,openid,phoneNum,authCode,response);	
														}catch(err){
															var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
															processHandler.errorLog(db,errorMsg,response);
															}										
													}else{
														var ret = JSON.stringify({result:'error',msg:'authCode is not defined'});
														httpRet.writeResponse(response,ret);
														}	
												}else{
													var ret = JSON.stringify({result:'error',msg:'phoneNum is not defined'});
													httpRet.writeResponse(response,ret);
													}	
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//更新学生资料
									if(command == "modStudentProfile"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.userName)!='undefined'){
												var userName = obj.userName;								
												if(typeof(obj.desLong)!='undefined'){
													var desLong = obj.desLong;
													try {
														studentHandler.modStudentProfile(db,openid,userName,desLong,response);
														}catch(err){
															var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
															processHandler.errorLog(db,errorMsg,response);
															}														
													}else{
														var ret = JSON.stringify({result:'error',msg:'desLong is not defined'});
														httpRet.writeResponse(response,ret);
														}													
												}else{
													var ret = JSON.stringify({result:'error',msg:'userName is not defined'});
													httpRet.writeResponse(response,ret);
													}	
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}
										
										
									//查询学生信息(后台功能)
									if(command == "getStudentByName"){
										if(typeof(obj.userName)!='undefined'){
											var userName = obj.userName;
											try {
												studentHandler.getStudentByName(db,userName,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}											
											}else{
												var ret = JSON.stringify({result:'error',msg:'userName is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//查询学生信息(后台功能)
									if(command == "getStudentByPhone"){
										if(typeof(obj.phoneNum)!='undefined'){
											var phoneNum = obj.phoneNum;
											try {
												studentHandler.getStudentByPhone(db,phoneNum,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}											
											}else{
												var ret = JSON.stringify({result:'error',msg:'phoneNum is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//查询学生信息(后台功能)
									if(command == "getStudentInfo"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												studentHandler.getStudentInfo(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}											
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}
										

									//学生登录
									if(command == "loginStudent"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												studentHandler.loginStudent(db,openid,response);	
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}											
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}
										
									//注册老师
									if(command == "addTeacher"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.phoneNum)!='undefined'){
												var phoneNum = obj.phoneNum;								
												if(typeof(obj.authCode)!='undefined'){
													var authCode = obj.authCode;
													try {
														teacherHandler.addTeacher(db,openid,phoneNum,authCode,response);	
														}catch(err){
															var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
															processHandler.errorLog(db,errorMsg,response);
															}										
													}else{
														var ret = JSON.stringify({result:'error',msg:'authCode is not defined'});
														httpRet.writeResponse(response,ret);
														}	
												}else{
													var ret = JSON.stringify({result:'error',msg:'phoneNum is not defined'});
													httpRet.writeResponse(response,ret);
													}	
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//更新老师资料
									if(command == "modTeacherProfile"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.userName)!='undefined'){
												var userName = obj.userName;								
												if(typeof(obj.desShort)!='undefined'){
													var desShort = obj.desShort;
													if(typeof(obj.desLong)!='undefined'){
														var desLong = obj.desLong;
														if(typeof(obj.homeAddressId)!='undefined'){
															var homeAddressId = obj.homeAddressId;
															try {
																teacherHandler.modTeacherProfile(db,openid,userName,desShort,desLong,homeAddressId,response);
																}catch(err){
																	var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
																	processHandler.errorLog(db,errorMsg,response);
																	}
															}else{
																var ret = JSON.stringify({result:'error',msg:'homeAddressId is not defined'});
																httpRet.writeResponse(response,ret);
																}															
														}else{
															var ret = JSON.stringify({result:'error',msg:'desLong is not defined'});
															httpRet.writeResponse(response,ret);
															}													
													}else{
														var ret = JSON.stringify({result:'error',msg:'desShort is not defined'});
														httpRet.writeResponse(response,ret);
														}	
												}else{
													var ret = JSON.stringify({result:'error',msg:'userName is not defined'});
													httpRet.writeResponse(response,ret);
													}	
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}
										
										
									//查询老师信息(后台功能)
									if(command == "getTeacherByName"){
										if(typeof(obj.userName)!='undefined'){
											var userName = obj.userName;
											try {
												teacherHandler.getTeacherByName(db,userName,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}											
											}else{
												var ret = JSON.stringify({result:'error',msg:'userName is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//查询老师信息(后台功能)
									if(command == "getTeacherByPhone"){
										if(typeof(obj.phoneNum)!='undefined'){
											var phoneNum = obj.phoneNum;
											try {
												teacherHandler.getTeacherByPhone(db,phoneNum,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}											
											}else{
												var ret = JSON.stringify({result:'error',msg:'phoneNum is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//查询老师信息(后台功能)
									if(command == "getTeacherInfo"){
										try {
											teacherHandler.getTeacherInfo(db,response);
											}catch(err){
												var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
												processHandler.errorLog(db,errorMsg,response);
												}
										}
										
									//实名认证教师(后台功能)
									if(command == "modTeacherState"){
										if(typeof(obj.id)!='undefined'){
											var id = obj.id;
											if(typeof(obj.auth)!='undefined'){
												var auth = Number(obj.auth);
												try {
													teacherHandler.modTeacherState(db,id,auth,response);
													}catch(err){
														var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
														processHandler.errorLog(db,errorMsg,response);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'auth is not defined'});
													httpRet.writeResponse(response,ret);
													}														
											}else{
												var ret = JSON.stringify({result:'error',msg:'id is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//老师登录
									if(command == "loginTeacher"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												teacherHandler.loginTeacher(db,openid,response);	
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}											
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}
										
									//添加教师家庭住址
									if(command == "addHomeAddress"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.address)!='undefined'){
												var address = obj.address;
												if(typeof(obj.lat)!='undefined'){
													var lat = Number(obj.lat);
													if(typeof(obj.lnt)!='undefined'){
														var lnt = Number(obj.lnt);
														try {
															addressHandler.addHomeAddress(db,openid,address,lat,lnt,response);
															}catch(err){
																var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
																processHandler.errorLog(db,errorMsg,response);
																}											
														}else{
															var ret = JSON.stringify({result:'error',msg:'lnt is not defined'});
															httpRet.writeResponse(response,ret);
															}	
													}else{
														var ret = JSON.stringify({result:'error',msg:'lat is not defined'});
														httpRet.writeResponse(response,ret);
														}	
												}else{
													var ret = JSON.stringify({result:'error',msg:'address is not defined'});
													httpRet.writeResponse(response,ret);
													}	
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}
										}

									//查询教师所有家庭地址
									if(command == "getMyHomeAddress"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												addressHandler.getMyHomeAddress(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}									
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//查询教师家庭地址
									if(command == "getHomeAddress"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
										if(typeof(obj.homeAddressId)!='undefined'){
												var homeAddressId = obj.homeAddressId;
												try {
													addressHandler.getHomeAddress(db,openid,homeAddressId,response);
													}catch(err){
														var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
														processHandler.errorLog(db,errorMsg,response);
														}									
												}else{
													var ret = JSON.stringify({result:'error',msg:'homeAddressId is not defined'});
													httpRet.writeResponse(response,ret);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}
										
									//添加商铺地址
									if(command == "addShopAddress"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.address)!='undefined'){
												var address = obj.address;
												if(typeof(obj.lat)!='undefined'){
													var lat = Number(obj.lat);
													if(typeof(obj.lnt)!='undefined'){
														var lnt = Number(obj.lnt);
														try {
															addressHandler.addShopAddress(db,openid,address,lat,lnt,response);
															}catch(err){
																var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
																processHandler.errorLog(db,errorMsg,response);
																}											
														}else{
															var ret = JSON.stringify({result:'error',msg:'lnt is not defined'});
															httpRet.writeResponse(response,ret);
															}	
													}else{
														var ret = JSON.stringify({result:'error',msg:'lat is not defined'});
														httpRet.writeResponse(response,ret);
														}	
												}else{
													var ret = JSON.stringify({result:'error',msg:'address is not defined'});
													httpRet.writeResponse(response,ret);
													}	
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//查询商户所有商铺地址
									if(command == "getMyShopAddress"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												addressHandler.getMyShopAddress(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}									
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//查询指定商铺地址
									if(command == "getShopAddress"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.shopAddressId)!='undefined'){
												var shopAddressId = obj.shopAddressId;
												try {
													addressHandler.getShopAddress(db,openid,shopAddressId,response);
													}catch(err){
														var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
														processHandler.errorLog(db,errorMsg,response);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'shopAddressId is not defined'});
													httpRet.writeResponse(response,ret);
													}	
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//查询指定商铺地址
									if(command == "getAddressById"){
										if(typeof(obj.addressId)!='undefined'){
											var addressId = obj.addressId;
											try {
												addressHandler.getAddressById(db,addressId,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'addressId is not defined'});
												httpRet.writeResponse(response,ret);
												}
										}

									
									//删除地址
									if(command == "deleteMyAddress"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.id)!='undefined'){
												var id = obj.id;											
												try {
													addressHandler.deleteMyAddress(db,openid,id,response);
													}catch(err){
														var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
														processHandler.errorLog(db,errorMsg,response);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'id is not defined'});
													httpRet.writeResponse(response,ret);
													}											
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}
										}									
									
									//注册商户
									if(command == "addMerchant"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.phoneNum)!='undefined'){
												var phoneNum = obj.phoneNum;								
												if(typeof(obj.authCode)!='undefined'){
													var authCode = obj.authCode;
													try {
														merchantHandler.addMerchant(db,openid,phoneNum,authCode,response);
														}catch(err){
															var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
															processHandler.errorLog(db,errorMsg,response);
															}
													}else{
														var ret = JSON.stringify({result:'error',msg:'authCode is not defined'});
														httpRet.writeResponse(response,ret);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'phoneNum is not defined'});
													httpRet.writeResponse(response,ret);
													}	
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}									

										
									//商户登录
									if(command == "loginMerchant"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												merchantHandler.loginMerchant(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//添加商铺
									if(command == "addShop"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.shopName)!='undefined'){
												var shopName = obj.shopName;											
												try {
													shopHandler.addShop(db,openid,shopName,response);
													}catch(err){
														var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
														processHandler.errorLog(db,errorMsg,response);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'shopName is not defined'});
													httpRet.writeResponse(response,ret);
													}													
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//获取我的商铺
									if(command == "getMyShop"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;										
											try {
												shopHandler.getMyShop(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}
										
									//更新商铺资料
									if(command == "modShopProfile"){
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.shopName)!='undefined'){
												var shopName = obj.shopName;								
												if(typeof(obj.desShort)!='undefined'){
													var desShort = obj.desShort;
													if(typeof(obj.desLong)!='undefined'){
														var desLong = obj.desLong;
														if(typeof(obj.shopAddressId)!='undefined'){
															var shopAddressId = obj.shopAddressId;
															try {
																shopHandler.modShopProfile(db,openid,shopName,desShort,desLong,shopAddressId,response);
																}catch(err){
																	var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
																	processHandler.errorLog(db,errorMsg,response);
																	}
															}else{
																var ret = JSON.stringify({result:'error',msg:'shopAddressId is not defined'});
																httpRet.writeResponse(response,ret);
																}															
														}else{
															var ret = JSON.stringify({result:'error',msg:'desLong is not defined'});
															httpRet.writeResponse(response,ret);
															}													
													}else{
														var ret = JSON.stringify({result:'error',msg:'desShort is not defined'});
														httpRet.writeResponse(response,ret);
														}	
												}else{
													var ret = JSON.stringify({result:'error',msg:'shopName is not defined'});
													httpRet.writeResponse(response,ret);
													}	
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}

									//获取待审核的教学
									if(command == "getWaitShop"){
										try {
											shopHandler.getWaitShop(db,response);
											}catch(err){
												var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
												processHandler.errorLog(db,errorMsg,response);
												}							
										}
										
									//核准商铺(后台功能)
									if(command == "modShopState"){
										if(typeof(obj.id)!='undefined'){
											var id = obj.id;
											try {
												shopHandler.modShopState(db,id,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}								
											}else{
												var ret = JSON.stringify({result:'error',msg:'id is not defined'});
												httpRet.writeResponse(response,ret);
												}	
										}
										
									//查找附近商铺
									if(command == "findShop"){
										if(typeof(obj.lat)!='undefined'){
											var lat = Number(obj.lat);
											if(typeof(obj.lng)!='undefined'){
												var lng = Number(obj.lng);
												if(typeof(obj.range)!='undefined'){
													var range = Number(obj.range);
													try {
														shopHandler.findShop(db,lat,lng,range,response);
														}catch(err){
															var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
															processHandler.errorLog(db,errorMsg,response);
															}	
													}else{
														var ret = JSON.stringify({result:'error',msg:'range is not defined'});
														httpRet.writeResponse(response,ret);
														}														
												}else{
													var ret = JSON.stringify({result:'error',msg:'lng is not defined'});
													httpRet.writeResponse(response,ret);
													}	
											}else{
												var ret = JSON.stringify({result:'error',msg:'lat is not defined'});
												httpRet.writeResponse(response,ret);
												}									
										}									
										
									//添加手机验证信息
									if(command == "addCheckPhone"){
										if(typeof(obj.phoneNum)!="undefined"){
											var phoneNum = obj.phoneNum;
											try {
												apiHandler.addCheckPhone(db,phoneNum,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'phoneNum is not defined'});
												httpRet.writeResponse(response,ret);
												}
											}
									
									//添加视频
									if(command == "addVideo"){
										if(typeof(obj.videoid)!="undefined"){
											var videoid = obj.videoid;
											if(typeof(obj.openid)!="undefined"){
												var openid = obj.openid;
												if(typeof(obj.title)!="undefined"){
													var title = obj.title;
													try {
														youkuHandler.addVideo(db,videoid,openid,title,response);
														}catch(err){
															var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
															processHandler.errorLog(db,errorMsg,response);
															}
													}else{
														var ret = JSON.stringify({result:'error',msg:'title is not defined'});
														httpRet.writeResponse(response,ret);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
													httpRet.writeResponse(response,ret);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'videoid is not defined'});
												httpRet.writeResponse(response,ret);
												}
											}
									
									//获取我的视频
									if(command == "getMyVideo"){
										if(typeof(obj.openid)!="undefined"){
											var openid = obj.openid;
											try {
												youkuHandler.getMyVideo(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}
											}

									//增添教学类型(后台)
									if(command == "addCourseType"){
										if(typeof(obj.typeName)!="undefined"){
											var typeName = obj.typeName;
											if(typeof(obj.imgUrl)!="undefined"){
												var imgUrl = obj.imgUrl;
												try {
													courseTypeHandler.addCourseType(db,typeName,imgUrl,response);
													}catch(err){
														var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
														processHandler.errorLog(db,errorMsg,response);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'imgUrl is not defined'});
													httpRet.writeResponse(response,ret);
													}			
											}else{
												var ret = JSON.stringify({result:'error',msg:'typeName is not defined'});
												httpRet.writeResponse(response,ret);
												}
										}

									//删除教学类型(后台)
									if(command == "delectCourseType"){
										if(typeof(obj.id)!="undefined"){
											var id = obj.id;
											try {
												courseTypeHandler.delectCourseType(db,id,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'id is not defined'});
												httpRet.writeResponse(response,ret);
												}
										}
									
								//获取所有教学类型
									if(command == "getAllCourseType"){
										try {
											courseTypeHandler.getAllCourseType(db,response);
											}catch(err){
												var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
												processHandler.errorLog(db,errorMsg,response);
												}
										}

									
									//增添教学
									if(command == "addCourse"){
										if(typeof(obj.openid)!="undefined"){
											var openid = obj.openid;
											if(typeof(obj.courseType)!="undefined"){
												var courseType = obj.courseType;
												if(typeof(obj.courseName)!="undefined"){
													var courseName = obj.courseName;
													if(typeof(obj.homeService)!="undefined"){
														var homeService = obj.homeService;													
														if(typeof(obj.address1)!="undefined"){
															var address1 = obj.address1;
															if(typeof(obj.address2)!="undefined"){
																var address2 = obj.address2;
																if(typeof(obj.price)!="undefined"){
																	var price = Number(obj.price);
																	if(typeof(obj.courseLength)!="undefined"){
																		var courseLength = Number(obj.courseLength);
																		if(typeof(obj.totalCourse)!="undefined"){
																			var totalCourse = Number(obj.totalCourse);
																			if(typeof(obj.trail)!="undefined"){
																				var trail = obj.trail;
																				if(typeof(obj.day)!="undefined"){
																					var day = obj.day;
																					if(typeof(obj.time)!="undefined"){
																						var time = obj.time;
																						if(typeof(obj.note)!="undefined"){
																							var note = obj.note;
																						try {
																							orderHandler.addCourse(db,openid,courseType,courseName,homeService,address1,address2,price,courseLength,totalCourse,trail,day,time,note,response);
																							}catch(err){
																								var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
																								processHandler.errorLog(db,errorMsg,response);
																								}
																							}else{
																								var ret = JSON.stringify({result:'error',msg:'note is not defined'});
																								httpRet.writeResponse(response,ret);
																								}
																						}else{
																							var ret = JSON.stringify({result:'error',msg:'time is not defined'});
																							httpRet.writeResponse(response,ret);
																							}
																					}else{
																						var ret = JSON.stringify({result:'error',msg:'day is not defined'});
																						httpRet.writeResponse(response,ret);
																						}																						
																				}else{
																					var ret = JSON.stringify({result:'error',msg:'trail is not defined'});
																					httpRet.writeResponse(response,ret);
																					}
																			}else{
																				var ret = JSON.stringify({result:'error',msg:'totalCourse is not defined'});
																				httpRet.writeResponse(response,ret);
																				}
																		}else{
																			var ret = JSON.stringify({result:'error',msg:'courseLength is not defined'});
																			httpRet.writeResponse(response,ret);
																			}
																	}else{
																		var ret = JSON.stringify({result:'error',msg:'price is not defined'});
																		httpRet.writeResponse(response,ret);
																		}
																}else{
																	var ret = JSON.stringify({result:'error',msg:'address2 is not defined'});
																	httpRet.writeResponse(response,ret);
																	}
															}else{
																var ret = JSON.stringify({result:'error',msg:'address1 is not defined'});
																httpRet.writeResponse(response,ret);
																}
														}else{
															var ret = JSON.stringify({result:'error',msg:'homeService is not defined'});
															httpRet.writeResponse(response,ret);
															}
													}else{
														var ret = JSON.stringify({result:'error',msg:'courseName is not defined'});
														httpRet.writeResponse(response,ret);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'courseType is not defined'});
													httpRet.writeResponse(response,ret);
													}												
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}										
										}		
									
									//删除教学
									if(command == "delectCourse"){
										if(typeof(obj.openid)!="undefined"){
											var openid = obj.openid;
											if(typeof(obj.id)!="undefined"){
												var id = obj.id;
												try {
													orderHandler.delectCourse(db,openid,id,response);
													}catch(err){
														var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
														processHandler.errorLog(db,errorMsg,response);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'id is not defined'});
													httpRet.writeResponse(response,ret);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}											
										}
										
									//修改教学地址
									if(command == "modCourseAddress"){
										if(typeof(obj.openid)!="undefined"){
											var openid = obj.openid;
											if(typeof(obj.id)!="undefined"){
												var id = obj.id;
												if(typeof(obj.address1)!="undefined"){
													var address1 = obj.address1;
													if(typeof(obj.address2)!="undefined"){
														var address2 = obj.address2;
														try {
															courseHandler.modCourseAddress(db,openid,id,address1,address2,response);
															}catch(err){
																var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
																processHandler.errorLog(db,errorMsg,response);
																}
														}else{
															var ret = JSON.stringify({result:'error',msg:'address2 is not defined'});
															httpRet.writeResponse(response,ret);
															}
													}else{
														var ret = JSON.stringify({result:'error',msg:'address1 is not defined'});
														httpRet.writeResponse(response,ret);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'id is not defined'});
													httpRet.writeResponse(response,ret);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}											
										}
									//获取我的教学
									if(command == "getMyCourse"){
										if(typeof(obj.openid)!="undefined"){
											var openid = obj.openid;
											try {
												orderHandler.getMyCourse(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);
												}											
										}

									//获取待审核的教学
									if(command == "getWaitCourse"){
										try {
											orderHandler.getWaitCourse(db,response);
											}catch(err){
												var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
												processHandler.errorLog(db,errorMsg,response);
												}							
										}

									//审核教学
									if(command == "authCourse"){
										if(typeof(obj.id)!="undefined"){
											var id = obj.id;											
											try {
												orderHandler.authCourse(db,id,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'id is not defined'});
												httpRet.writeResponse(response,ret);
												}												
										}

									//审核教学
									if(command == "unauthCourse"){
										if(typeof(obj.id)!="undefined"){
											var id = obj.id;
											if(typeof(obj.unauth)!="undefined"){
												var unauth = obj.unauth;
												try {
													orderHandler.unauthCourse(db,id,unauth,response);
													}catch(err){
														var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
														processHandler.errorLog(db,errorMsg,response);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'unauth is not defined'});
													httpRet.writeResponse(response,ret);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'id is not defined'});
												httpRet.writeResponse(response,ret);
												}												
										}
									
									//修改课程时间
									if(command == "addCourseTime"){
										console.log("addCourseTime...");
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											if(typeof(obj.order_id)!='undefined'){
												var order_id = obj.order_id;
												if(typeof(obj.firstTime)!='undefined'){
													var firstTime = obj.firstTime;
													if(typeof(obj.interval)!='undefined'){
														var interval = obj.interval;
														try {
															orderHandler.addCourseTime(db,openid,order_id,firstTime,interval,response);
															}catch(err){
																console.log(err);
																var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
																processHandler.errorLog(db,errorMsg,response);
																}
														}else{
															var ret = JSON.stringify({result:'error',msg:'interval is not defined'});
															orderHandler.writeResponse(response,ret);									
															}
													}else{
														var ret = JSON.stringify({result:'error',msg:'firstTime is not defined'});
														orderHandler.writeResponse(response,ret);									
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'order_id is not defined'});
													orderHandler.writeResponse(response,ret);									
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												orderHandler.writeResponse(response,ret);									
												}
										}	
										
									//查找教学
									if(command == "findCourseByType"){
										if(typeof(obj.courseType)!="undefined"){
											var courseType = obj.courseType;
											if(typeof(obj.courseName)!="undefined"){
												var courseName = obj.courseName;												
												try {
													orderHandler.findCourseByType(db,courseType,courseName,response);
													}catch(err){
														var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
														processHandler.errorLog(db,errorMsg,response);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'courseName is not defined'});
													httpRet.writeResponse(response,ret);
													}	
											}else{
												var ret = JSON.stringify({result:'error',msg:'courseType is not defined'});
												httpRet.writeResponse(response,ret);
												}												
										}

									//查找教学
									if(command == "findInterestCourse"){
										if(typeof(obj.courseName)!="undefined"){
											try{
												var courseName = JSON.parse(obj.courseName);
												}catch(e){
													console.log("error when trying to parse JSON");
													}
											console.log(typeof(courseName));
											if(typeof(courseName)=="object"){
												var courseName = obj.courseName;												
												try {
													orderHandler.findInterestCourse(db,courseName,response);
													}catch(err){
														var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
														processHandler.errorLog(db,errorMsg,response);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'courseName is not an array'});
													httpRet.writeResponse(response,ret);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'courseName is not defined'});
												httpRet.writeResponse(response,ret);											
												}
									}
										
									//创建订单
									if(command == "addCourseOrder"){
										console.log("addCourseOrder...");
										if(typeof(obj.courseId)!='undefined'){
											var courseId = obj.courseId;
											if(typeof(obj.openid)!='undefined'){
												var openid = obj.openid;
												try {
													orderHandler.addCourseOrder(db,courseId,openid,response);
													}catch(err){
														var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
														processHandler.errorLog(db,errorMsg,response);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
													httpRet.writeResponse(response,ret);									
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'courseId is not defined'});
												httpRet.writeResponse(response,ret);									
												}								
										}

									//获取我的所有订单
									if(command == "getAllMyOrder"){
										console.log("getAllMyOrder...");
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												orderHandler.getAllMyOrder(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);									
												}								
										}
										
									//获取我所有未支付订单
									if(command == "getAllMyUnpaidOrder"){
										console.log("getAllMyUnpaidOrder...");
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												orderHandler.getAllMyUnpaidOrder(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);									
												}								
										}

									//获取我所有已支付订单
									if(command == "getAllMyPaidOrder"){
										console.log("getAllMyPaidOrder...");
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												orderHandler.getAllMyPaidOrder(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);									
												}								
										}
										
									//获取我所有已支付订单
									if(command == "getAllMyRefundOrder"){
										console.log("getAllMyRefundOrder...");
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												orderHandler.getAllMyRefundOrder(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);									
												}								
										}
									

									//获取我收到的已支付订单
									if(command == "getAllMyReceivedOrder"){
										console.log("getAllMyReceivedOrder...");
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												orderHandler.getAllMyReceivedOrder(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);									
												}								
										}
									
									//订单退款
									if(command == "refundOrder"){
										console.log("refundOrder...");
										if(typeof(obj.id)!='undefined'){
											var id = obj.id;
											try {
												orderHandler.refundOrder(db,id,response);
												}catch(err){
													console.log(err);
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'id is not defined'});
												orderHandler.writeResponse(response,ret);									
												}
										}
										
									//订单退款
									if(command == "refund"){
										console.log("refund...");
										if(typeof(obj.out)!='undefined'){
											var out = obj.out;
											if(typeof(obj.fee)!='undefined'){
												var fee = obj.fee;
												if(typeof(obj.refund_fee)!='undefined'){
													var refund_fee = obj.refund_fee;
													try {
														orderHandler.refund(db,out,fee,refund_fee,response);
														}catch(err){
															console.log(err);
															var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
															processHandler.errorLog(db,errorMsg,response);
															}
													}else{
														var ret = JSON.stringify({result:'error',msg:'refund_fee is not defined'});
														orderHandler.writeResponse(response,ret);									
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'fee is not defined'});
													orderHandler.writeResponse(response,ret);									
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'out is not defined'});
												orderHandler.writeResponse(response,ret);									
												}
										}								

									//订单消息测试
									if(command == "orderMessageTest"){
										console.log("orderMessageTest...");
										if(typeof(obj.out)!='undefined'){
											var out = obj.out;
											try {
												messageHandler.sendOrderMessage(db,out);
												}catch(err){
													console.log(err);
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'out is not defined'});
												orderHandler.writeResponse(response,ret);									
												}
										}
										
										
									//为订单创建支付链接
									if(command == "createPrepayLink"){
										console.log("createPrepayLink...");
										if(typeof(obj.id)!='undefined'){
											var id = obj.id;
											try {
												orderHandler.createPrepayLink(db,id,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'id is not defined'});
												httpRet.writeResponse(response,ret);									
												}								
										}										

									//（学生）查询所有已支付订单
									if(command == "getMyPaidCourse"){
										console.log("getMyPaidCourse...");
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												orderHandler.getMyPaidCourse(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);									
												}								
										}									
										
									//开始签到（老师）	
									if(command == "startCheckCourse"){
										console.log("startCheckCourse...");
										if(typeof(obj.id)!='undefined'){
											var id = obj.id;
											if(typeof(obj.openid)!='undefined'){
												var openid = obj.openid;
												if(typeof(obj.comment)!='undefined'){
													var comment = obj.comment;
													try {
														orderHandler.startCheckCourse(db,openid,id,comment,response);
														}catch(err){
															var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
															processHandler.errorLog(db,errorMsg,response);
															}
													}else{
														var ret = JSON.stringify({result:'error',msg:'comment is not defined'});
														httpRet.writeResponse(response,ret);
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
													httpRet.writeResponse(response,ret);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'id is not defined'});
												httpRet.writeResponse(response,ret);									
												}										
										}		
											
									//签到（学生）	
									if(command == "checkCourse"){
										console.log("checkCourse...");
										if(typeof(obj.id)!='undefined'){
											var id = obj.id;
											if(typeof(obj.openid)!='undefined'){
												var openid = obj.openid;
												if(typeof(obj.score)!='undefined'){
													var score = obj.score;
													try {
														orderHandler.checkCourse(db,openid,id,score,response);
														}catch(err){
															var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
															processHandler.errorLog(db,errorMsg,response);
															}
														}else{
															var ret = JSON.stringify({result:'error',msg:'score is not defined'});
															httpRet.writeResponse(response,ret);
															}													
												}else{
													var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
													httpRet.writeResponse(response,ret);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'id is not defined'});
												httpRet.writeResponse(response,ret);									
												}										
										}

									//为签到页获取课程及老师名称	
									if(command == "getCourseInfo"){
										console.log("getCourseInfo...");
										if(typeof(obj.id)!='undefined'){
											var id = obj.id;
											try {
												orderHandler.getCourseInfo(db,id,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'id is not defined'});
												httpRet.writeResponse(response,ret);									
												}										
										}
										
									//根据openid查询用户	
									if(command == "findUserByOpenid"){
										console.log("findUserByOpenid...");
										if(typeof(obj.openid)!='undefined'){
											var openid = obj.openid;
											try {
												teacherHandler.findUserByOpenid(db,openid,response);
												}catch(err){
													var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
													processHandler.errorLog(db,errorMsg,response);
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
												httpRet.writeResponse(response,ret);									
												}										
										}
										
								}							
							}
						postData = "";
						});
						
				}).listen(httpPort,function(){
					console.log("Post server has started on port "+httpPort);
					});
					
			http.createServer(function (request, response){
				request.setEncoding("utf8");
				var postData = "";
				request.addListener("data", function(postDataChunk) {
					postData += postDataChunk;
					console.log("Received POST data chunk '"+ postDataChunk + "'.");
					});
				request.addListener("end", function(){
					//console.log("weixin notify info:["+postData+"]");
					console.log("start processing notified info");
					var hasErr = 0;
					try{
						console.log(postData);
						parser.parseString(postData);
						}catch(err){
							hasErr = 1;
							console.log(err);
							var errorMsg = '\n'+ 'Error ' + new Date().toISOString() + ' ' + request.url+ '\n'+ err.stack || err.message || 'unknow error'+ '\n';
							processHandler.errorLog(db,errorMsg,response);						
							}
					if(hasErr == 1){
						;
						}else{
							//parse的结果处理函数
							//向微信发送收到消息的xml通知
							var retJson = {return_code:"SUCCESS",return_msg:"OK"};
							var retXml = builder.buildObject(retJson);
							console.log(retXml);
							httpRet.writeResponse(response,retXml);
							}
					});
				}).listen(weixinNotifyPort,function(){
					console.log("weixin notify port open on "+weixinNotifyPort);	
					});	
			});	
		}
	});




