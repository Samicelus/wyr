var uuid = require('uuid');
var http = require('http');
var https = require('https');
var httpRet = require('./httpRet')
var crypto = require('crypto');
var str_tmp ="";
var serverIP = "119.29.92.190";
var fs = require('fs');

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
				var condition = {openid:openid,shopName:shopName};
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
函数名:getMyShop(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    查询某openid下的商铺
作者：徐思源
时间：20151230
************************************************************/
function getMyShop(db,openid,response){
	db.collection("shop", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到该商铺");
								httpRet.alertMsg(response,'error',"没有找到该商铺",'0');
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
函数名:modShopProfile(db,openid,shopName,desShort,desLong,shopAddressId,response)
参数及释义：
db							操作的数据库对象
openid
shopName
desShort
desLong
shopAddressId
response					用于返回get请求的对象体
函数作用：
    更新商铺资料
作者：徐思源
时间：20151230
************************************************************/
function modShopProfile(db,openid,shopName,desShort,desLong,shopAddressId,response){
	db.collection("shop", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,shopName:shopName};
				var mod = {$set:{desShort:desShort,desLong:desLong,shopAddressId:shopAddressId,state:0}};
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
函数名:getWaitShop(db,response)
参数及释义：
db							操作的数据库对象
response					用于返回get请求的对象体
函数作用：
    获取所有state为0的商铺
作者：徐思源
时间：20160112
************************************************************/
function getWaitShop(db,response){
	db.collection("shop", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {state:0};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到对应商铺");
								httpRet.alertMsg(response,'error',"没有找到对应商铺",'0');
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
函数名:modShopState(db,id,response)
参数及释义：
db							操作的数据库对象
id
response					用于返回get请求的对象体
函数作用：
    核准商铺
作者：徐思源
时间：20151230
************************************************************/
function modShopState(db,id,response){
	db.collection("shop", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {_id:id,state:0};
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
函数名:findShop(db,lat,lng,response)
参数及释义：
db							操作的数据库对象
shopName
response					用于返回get请求的对象体
函数作用：
    查找附近商铺,先查询附近的商铺地址,再用结果数组匹配对应的商铺
作者：徐思源
时间：20151230
************************************************************/
function findShop(db,lat,lng,range,response){
	db.collection("address", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {addressType:"shop",location:{$within:{$center:[[Number(lng),Number(lat)],Number(range)]}}};
				var affiche = {_id:1};
				collection.find(condition,affiche).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');						
						}else{
							if(bars.length == 0){
								httpRet.alertMsg(response,'error',"没有找到附近的商铺",'0');	
								}else{
									var shopAddressIdList = new Array();
									for(var i in bars){
										shopAddressIdList.push({shopAddressId:bars[i]._id});
										}
									var condition2 = {state:1,$or:shopAddressIdList};
									db.collection("shop", function(err, collection){
										if(err){
											console.log("error:"+err);
											httpRet.alertMsg(response,'error',err,'0');
											}else{
												collection.find(condition2).toArray(function(err,bars2){
													if(err){
														console.log("error:"+err);
														httpRet.alertMsg(response,'error',err,'0');	
														}else{
															if(bars2.length == 0){
																httpRet.alertMsg(response,'error',"没有找到附近的商铺",'0');
																}else{
																	httpRet.alertMsg(response,'success',"查询成功",bars2);
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
	
	
/****************商铺相关*******************/
exports.addShop = addShop;
exports.getMyShop = getMyShop;
exports.modShopProfile = modShopProfile;
exports.getWaitShop = getWaitShop;
exports.modShopState = modShopState;
exports.findShop = findShop;

