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
    添加家庭住址
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
							if(bars.length < 10){
								//还没有家庭住址
								var addressData = {_id:xid,openid:openid,addressType:"home",address:address,location:{type:"Point",coordinates:[lnt,lat]}};
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
									//超过最大住址限制
									console.log("家庭住址数超过10个，请删除不使用的住址再添加");
									httpRet.alertMsg(response,'error',"家庭住址数超过10个，请删除不使用的住址再添加",'0');
									}
							}
					});
				}
		});
	}

/************************************************************
函数名:getMyHomeAddress(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    查询某openid下的家庭地址
作者：徐思源
时间：20151230
************************************************************/
function getMyHomeAddress(db,openid,response){
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
函数名:getHomeAddress(db,openid,homeAddressId,response)
参数及释义：
db							操作的数据库对象
openid
homeAddressId
response					用于返回get请求的对象体
函数作用：
    查询某openid下的家庭地址
作者：徐思源
时间：20151230
************************************************************/
function getHomeAddress(db,openid,homeAddressId,response){
	db.collection("address", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,addressType:"home",_id:homeAddressId};
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
    添加商铺地址
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
				var condition = {openid:openid,addressType:"shop"};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length >= 10){
								httpRet.alertMsg(response,'error','该openid下的商铺地址超过10个,创建失败','0');
								}else{
									var xid = uuid.v4();
									var addressData = {_id:xid,openid:openid,addressType:"shop",address:address,location:{type:"Point",coordinates:[lnt,lat]}};
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
函数名:getMyShopAddress(db,openid,response)
参数及释义：
db							操作的数据库对象
openid
response					用于返回get请求的对象体
函数作用：
    查询某openid下的所有商户地址
作者：徐思源
时间：20151230
************************************************************/
function getMyShopAddress(db,openid,response){
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
函数名:getShopAddress(db,openid,shopAddressId,response)
参数及释义：
db							操作的数据库对象
openid
shopAddressId
response					用于返回get请求的对象体
函数作用：
    查询某openid下的指定商户地址
作者：徐思源
时间：20151230
************************************************************/
function getShopAddress(db,openid,shopAddressId,response){
	db.collection("address", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {openid:openid,addressType:"shop",_id:shopAddressId};
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
函数名:getAddressById(db,addressId,response)
参数及释义：
db							操作的数据库对象
addressId
response					用于返回get请求的对象体
函数作用：
    查询id下对应地址
作者：徐思源
时间：20151230
************************************************************/
function getAddressById(db,addressId,response){
	db.collection("address", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var condition = {_id:addressId};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							if(bars.length == 0){
								console.log("没有找到该地址");
								httpRet.alertMsg(response,'error',"没有找到该地址",'0');
								}else{
									console.log("查询成功");
									httpRet.alertMsg(response,'success',"查询成功",bars);
									}
							}
					});
				}
		});
	}

/****************地址相关*******************/
exports.addHomeAddress = addHomeAddress;//
exports.getMyHomeAddress = getMyHomeAddress;
exports.getHomeAddress = getHomeAddress;
exports.addShopAddress = addShopAddress;
exports.getMyShopAddress = getMyShopAddress;
exports.getShopAddress = getShopAddress;
exports.getAddressById = getAddressById;