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
function checkJwt(token,db){
	var decoded = jwt.decode(token, secret);
	var openid = decoded.openid;
	var userType = decoded.userType;
	db.collection("user", function(err, collection){
		if(err){
			console.log("error:"+err);
			return false;
			}else{
				var condition = {openid:openid,userType:userType};
				collection.find(condition).toArray(function(err,bars){
					if(err){
						console.log("error:"+err);
						return false;
						}else{
							if(bars.length == 0){
								return false;
								}else{
									return decoded;
									}
							}
					});
				}
		});
	}

exports.generateJwt = generateJwt;
exports.checkJwt = checkJwt;

