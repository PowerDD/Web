var request = require('request');
exports.index = function(req, res, data){
	if (data.screen == 'index') {
		data.title = 'หน้าหลัก';
	}
	res.send(data);
	//exports.getCategory(req, res, data);

};

exports.getCategory = function(req, res, data){
	//## Get Category Menu ##//
	try{
		request.post({headers: { 'referer': data.websiteUrl }, url: data.apiUrl + '/category/info',
			form: {
				apiKey: data.apiKey,
				shop: data.shop
			}
		},
		function (error, response, body) {
			if (!error) {				
				var json = JSON.parse(body);
				data.category = json.result;
				res.send(data);
			} else{
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