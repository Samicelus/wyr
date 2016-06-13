var jwt = require('jwt-simple');
var secret = 'fas8k2389c8wreWS91LCUAQeteqoc28s9a231';

/************************************************************
函数名：encodeOpenid(openid)
参数及释义：
函数作用：

作者：徐思源
时间：20160613
************************************************************/
function decodeOpenid(token){
	var payload = {openid:openid};
	return jwt.encode(payload,secret);
	}

/************************************************************
函数名：checkJwt(token,db)
参数及释义：
函数作用：

作者：徐思源
时间：20160613
************************************************************/
function decodeOpenid(token){
	var decoded = jwt.decode(token, secret);
	var openid = decoded.openid;
	return openid;
	}

exports.encodeOpenid = encodeOpenid;
exports.decodeOpenid = decodeOpenid;

