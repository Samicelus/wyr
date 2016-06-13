var jwt = require('jwt-simple');
var secret = 'oPque1jZz24Waa7seq2QRza';

/************************************************************
函数名：generateJwt(payload)
参数及释义：
函数作用：

作者：徐思源
时间：20160613
************************************************************/
function generateJwt(payload){
	return jwt.encode(payload,secret);
	}

/************************************************************
函数名：checkJwt(token,db)
参数及释义：
函数作用：

作者：徐思源
时间：20160613
************************************************************/
function checkJwt(token,db,cb){
	var decoded = jwt.decode(token, secret);
	console.log('decoded:'+JSON.stringify(decoded));
	var openid = decoded.openid;
	var userType = decoded.userType;
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			cb(false);
			}else{
				var condition = {openid:openid,userType:userType};
				//console.log(condition);
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						cb(false);
						}else{
							//console.log(bars);
							//console.log(bars.length);
							if(bars.length == 0){
								cb(false);
								}else{
									cb(decoded);
									}
							}
					});
				}
		});
	}

exports.generateJwt = generateJwt;
exports.checkJwt = checkJwt;

