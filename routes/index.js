var request = require('request');
exports.index = function(req, res, data){
	if (data.screen == 'index') {
		data.title = 'หน้าหลัก';
	}

	try{
		request('http://www.google.com',
		function (error, response, body) {
			if (!error) {				
				// var json = JSON.parse(body);
				// data.category = json.result;
				res.send(body);
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

// exports.getCategory = function(req, res, data){
	// try{
		// request.post({url: {data.apiUrl + '/category/info'},
			// form: {
				// apiKey: data.apiKey,
				// shop: data.shop
			// }
		// },
		// function (error, response, body) {
			// if (!error) {				
				// var json = JSON.parse(body);
				// data.category = json.result;
				// res.send(data);
			// } else{
				// data.error = error.message;
				// data.stack = error.stack;
				// res.render('error', { data: data });
			// }
		// });
	// }
	// catch(error) {
		// data.error = error.message;
		// data.stack = error.stack;
		// res.render('error', { data: data });
	// }
// };