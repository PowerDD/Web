//var request = require('request');

exports.index = function(req, res, data){
	//## Set Page Title ##//
	if (data.screen == 'index') {	
		data.title = 'หน้าหลัก';
	}
	res.send(data);
	//exports.getBrand(req, res, data);
	
};
