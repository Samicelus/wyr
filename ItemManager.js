var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var http = require('http');
var url = require('url');
var uuid = require('uuid');
var mongoHandler= require('./itemHandler');
var querystring = require("querystring");
var md5 = require('md5');
var dgram = require('dgram');
// s 这里是个全局的 socket
var s = dgram.createSocket('udp4');
var fs = require("fs");
//xml2js相关类
var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray:false});
var builder = new xml2js.Builder({rootName:'xml',headless:true,cdata:true});


fs.readFile('./config.json', function (err, data){
	var mongoPort = JSON.parse(data).mongoPort;	
	var weixinNotifyPort = JSON.parse(data).weixinNotifyPort;
	var itemHttpPort = JSON.parse(data).itemHttpPort;
	var  partner_key = JSON.parse(data).partner_key;
	
	//连接本地Mongodb数据库，连接池大小10
	var mongodbServer = new mongodb.Server('localhost', mongoPort, { auto_reconnect: true, poolSize: 10 });
	//连接的数据库名称为productReg 相当于命令行 use productReg
	var db = new mongodb.Db('productReg', mongodbServer);


	/* 开启数据库 */
	db.open(function(){
	

	//xml2js处理结果
	parser.addListener('end', function(result) {
		if(typeof(result)!='undefined'){
			if(typeof(result.xml)!='undefined'){
				var total_fee = result.xml.total_fee;
				var nonce_str = result.xml.nonce_str;
				var openid = result.xml.openid;
				var out_trade_no = result.xml.out_trade_no;
				var sign = result.xml.sign;
				var transaction_id = result.xml.transaction_id;
				//验证签名
				var obj = result.xml; 
				var signVer = mix(obj);
				
				if(signVer == sign){
					console.log("signature verified");
					console.log("支付消息: openid 为: "+openid+" 的用户为订单号为:"+out_trade_no+" 的商品支付了总共: "+(Number(total_fee)/100)+" 元.");
					console.log("支付消息签名: "+sign);
					console.log("微信支付交易单号: "+transaction_id);
					//更新订单支付状态
					mongoHandler.updateOrderInfo(db,out_trade_no,openid,transaction_id,total_fee);					
					}else{
						console.log("signature not verified");
						}
				}			
			}
		console.log(JSON.stringify(result));
	});

	http.createServer(function (request, response) {
				//将收到的请求记录下来
				fs.writeFile('./log2.txt',querystring.stringify(request),function(err){
				console.log("request logged");	
				});
				
				request.setEncoding("utf8");
				var postData = "";
				request.addListener("data", function(postDataChunk) {
					postData += postDataChunk;
					console.log("Received POST data chunk '"+ postDataChunk + "'.");
					});
				request.addListener("end", function(){
					//处理postData					
					console.log(postData);
					console.log("start processing item info");
					
					if(typeof(postData)!= "undefined"){					
						try{
							var obj = JSON.parse(postData);
							}catch(e){
								console.log(e);
								}							
						
						if(typeof(obj)!="undefined"){
							var command = obj.command;
							console.log("command:"+command);

							if(command == "addItem"){
								console.log("adding item...");
								if(typeof(obj.itemName)!='undefined'){
									var itemName = obj.itemName;
									if(typeof(obj.description)!='undefined'){
										var description = obj.description;							
										if(typeof(obj.fee)!='undefined'){
											var fee = obj.fee;
											if(typeof(obj.itemType)!='undefined'){
												var itemType = obj.itemType;												
												if(typeof(obj.provider)!='undefined'){
													var provider = obj.provider;
													mongoHandler.addItem(db,itemName,description,fee,itemType,provider,response);
													}else{
														var ret = JSON.stringify({result:'error',msg:'provider is not defined'});
														mongoHandler.writeResponse(response,ret);									
														}
												}else{
													var ret = JSON.stringify({result:'error',msg:'itemType is not defined'});
													mongoHandler.writeResponse(response,ret);									
													}
											}else{
												var ret = JSON.stringify({result:'error',msg:'fee is not defined'});
												mongoHandler.writeResponse(response,ret);									
												}
										}else{
											var ret = JSON.stringify({result:'error',msg:'description is not defined'});
											mongoHandler.writeResponse(response,ret);									
											}
									}else{
										var ret = JSON.stringify({result:'error',msg:'itemName is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}
								}
								
							if(command == "findItemByNameAndProvider"){
								console.log("find Item By Name And Provider...");
								if(typeof(obj.itemName)!='undefined'){
									var itemName = obj.itemName;																		
									if(typeof(obj.provider)!='undefined'){
										var provider = obj.provider;
										mongoHandler.findItemByNameAndProvider(db,itemName,provider,response);
										}else{
											var ret = JSON.stringify({result:'error',msg:'provider is not defined'});
											mongoHandler.writeResponse(response,ret);									
											}
									}else{
										var ret = JSON.stringify({result:'error',msg:'itemName is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}									
								}

							if(command == "findItemByName"){
								console.log("find Item By itemName...");
								if(typeof(obj.itemName)!='undefined'){
									var itemName = obj.itemName;
									mongoHandler.findItemByName(db,itemName,response);
									}else{
										var ret = JSON.stringify({result:'error',msg:'itemName is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}
								}
								
							if(command == "findItemByProvider"){
								console.log("find Item By Provider...");
								if(typeof(obj.provider)!='undefined'){
									var provider = obj.provider;
									mongoHandler.findItemByProvider(db,provider,response);
									}else{
										var ret = JSON.stringify({result:'error',msg:'provider is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}
								}
								
							if(command == "deleteItem"){
								console.log("deleteItem...");
								if(typeof(obj.id)!='undefined'){
									var id = obj.id;
									mongoHandler.deleteItem(db,id,response);
									}else{
										var ret = JSON.stringify({result:'error',msg:'id is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}
								}

							if(command == "addOrder"){
								console.log("addOrder...");
								if(typeof(obj.id)!='undefined'){
									var id = obj.id;
									if(typeof(obj.openid)!='undefined'){
										var openid = obj.openid;
										mongoHandler.addOrder(db,id,openid,response);
										}else{
											var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
											mongoHandler.writeResponse(response,ret);									
											}
									}else{
										var ret = JSON.stringify({result:'error',msg:'id is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}								
								}

							if(command == "getOrderInfo"){
								console.log("getOrderInfo...");
								if(typeof(obj.id)!='undefined'){
									var id = obj.id;
									mongoHandler.getOrderInfo(db,id,response);
									}else{
										var ret = JSON.stringify({result:'error',msg:'id is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}								
								}

							if(command == "getAllMyOrder"){
								console.log("getAllMyOrder...");
								if(typeof(obj.openid)!='undefined'){
									var openid = obj.openid;
									mongoHandler.getAllMyOrder(db,openid,response);
									}else{
										var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}								
								}

							if(command == "getAllMyUnpaidOrder"){
								console.log("getAllMyUnpaidOrder...");
								if(typeof(obj.openid)!='undefined'){
									var openid = obj.openid;
									mongoHandler.getAllMyUnpaidOrder(db,openid,response);
									}else{
										var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}								
								}

							if(command == "getAllMyPaidOrder"){
								console.log("getAllMyPaidOrder...");
								if(typeof(obj.openid)!='undefined'){
									var openid = obj.openid;
									mongoHandler.getAllMyPaidOrder(db,openid,response);
									}else{
										var ret = JSON.stringify({result:'error',msg:'openid is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}								
								}


							if(command == "refundOrder"){
								console.log("refundOrder...");
								if(typeof(obj.id)!='undefined'){
									var id = obj.id;
									mongoHandler.refundOrder(db,id,response);
									}else{
										var ret = JSON.stringify({result:'error',msg:'id is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}
								}
								
								
							if(command == "createPrepayLink"){
								console.log("createPrepayLink...");
								if(typeof(obj.orderId)!='undefined'){
									var orderId = obj.orderId;
									mongoHandler.createPrepayLink(db,orderId,response);
									}else{
										var ret = JSON.stringify({result:'error',msg:'orderId is not defined'});
										mongoHandler.writeResponse(response,ret);									
										}								
								}							
							}
						}
					postData = "";
					});
					
			}).listen(itemHttpPort);
		console.log("Post server has started on port "+itemHttpPort);

		
		http.createServer(function (request, response){
			request.setEncoding("utf8");
			var postData = "";
			request.addListener("data", function(postDataChunk) {
				postData += postDataChunk;
				console.log("Received POST data chunk '"+ postDataChunk + "'.");
				});
			request.addListener("end", function(){
				console.log("weixin notify info:["+postData+"]");
				console.log("start processing notified info");
				parser.parseString(postData);
				//parse的结果处理函数
				//向微信发送收到消息的xml通知
				var retJson = {return_code:"SUCCESS",return_msg:"OK"};
				var retXml = builder.buildObject(retJson);
				console.log(retXml);
				mongoHandler.writeResponse(response,retXml);
				});
		}).listen(weixinNotifyPort);
		console.log("weixin notify port open on "+weixinNotifyPort);
		

		
		});	
	});	
	
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
	
