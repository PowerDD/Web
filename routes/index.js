var request = require('request');
exports.index = function(req, res, data){
	if (data.screen == 'index') {
		data.title = 'หน้าหลัก';
	}

	exports.getBrand(req, res, data);

};

exports.getBrand = function(req, res, data){ //data.apiUrl + '/brand/info'
	try{
		/* request.post({headers: { 'referer': data.websiteUrl }, url: data.apiUrl + '/brand/info',
			form: {
				apiKey: data.apiKey,
				shop: data.shop
			}
		},
		function (error, response, body) {
			if (!error) {				
				res.send(body);
			} else{
				data.error = error.message;
				data.stack = error.stack;
				res.render('error', { data: data });
			}
		}); */
		
		request(data.apiUrl , function (error, response, body) {
			if (!error) {
				res.send(body);
		    }
		});
	}
	catch(error) {
		data.error = error.message;
		data.stack = error.stack;
		res.render('error', { data: data });
	}
};