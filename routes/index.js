var request = require('request');
exports.index = function(req, res, data){
	if (data.screen == 'index') {
		data.title = 'หน้าหลัก';
	}

	exports.getBrand(req, res, data);

};

exports.getBrand = function(req, res, data){ //data.apiUrl + '/brand/info'
	try{
		request('http://www.facebook.com', function (error, response, body) {
		if (!error) {
			res.send(body);
		}else{
			data.error = error.message;
			data.stack = error.stack;
			res.render('error', { data: data });
		}
		});
	}
	catch(error) {
		data.error = error.message;
		data.stack = error.stack;
		res.render('error', { data: data });
	}
};