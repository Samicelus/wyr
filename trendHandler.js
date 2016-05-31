var uuid = require('uuid');
var http = require('http');
var https = require('https');
var httpRet = require('./httpRet')
var crypto = require('crypto');
var str_tmp ="";
var serverIP = "119.29.92.190";
var fs = require('fs');
var uuid = require('uuid');
var moment = require('moment');
/************************************************************
函数名:addCourse(db,openid,out_trade_no)
参数及释义：
db							操作的数据库对象
函数作用：
    添加动态
作者：samicelus
时间：20160531
************************************************************/
function addTrend(db,openid,out_trade_no){
	db.collection("order", function(err, collection){
		if(err){
			console.log("error:"+err);
			httpRet.alertMsg(response,'error',err,'0');
			}else{
				var trendData = {openid:openid,time:time,timestamp:timestamp};
				collection.insert(trendData,function(err,data){
					if(err){
						console.log("error:"+err);
						httpRet.alertMsg(response,'error',err,'0');
						}else{
							console.log("动态添加成功");
							httpRet.alertMsg(response,'success',"动态添加成功",data);
							}
					});
				}
		});	
	}

/****************动态相关*******************/
exports.addTrend = addTrend;



var time = datetimeFormat();
var timestamp = new Date().getTime();

function datetimeFormat(time) {
    var res = moment(time).format('YYYY-MM-DD HH:mm:ss');
    return res == 'Invalid date' ? '' : res;
};

