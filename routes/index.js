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
		request.post({headers: { 'referer': data.websiteUrl }, url: data.apiUrl + '/brand/info',
			form: {
				apiKey: data.apiKey,
				shop: data.shop
			}
		},
		function (error, response, body) {
			if (!error) {				
				//var json = JSON.parse(body);
				//data.brand = json.result;
				res.send(body);
			}else{
				data.error = error.message;
				data.stack = error.stack;
				res.render('index', { data: data });
			}
		});
	}
	catch(error) {
		data.error = error.message;
		data.stack = error.stack;
		res.render('error', { data: data });
	};
};

