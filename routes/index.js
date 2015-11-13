exports.index = function(req, res, data){
	if (data.screen == 'index') {
		data.title = 'หน้าหลัก';
	}

	res.render(data.screen, { data: data });

};

exports.getBrand = function(req, res, data){
	try{
		request.post({headers: { 'referer': data.websiteUrl }, url: data.apiUrl + '/brand/info',
			form: {
				apiKey: data.apiKey,
				shop: data.shop
			}
		},
		function (error, response, body) {
			if (!error) {				
				var json = JSON.parse(body);
				data.brand = json.result;
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