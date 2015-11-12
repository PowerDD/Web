var request = require('request');

exports.index = function(req, res, data){
	//## Set Page Title ##//
	if (data.screen == 'index') {	
		data.title = 'หน้าหลัก';
	}
	exports.getBrand(req, res, data);
	
};

exports.getBrand = function(req, res, data){
	//## Get Brand ##//
	try{
		res.send('getBrand');
	}
	catch(error) {
		data.error = error.message;
		data.stack = error.stack;
		res.render('error', { data: data });
	};
};

