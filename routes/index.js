exports.index = function(req, res, data){
	/*if (data.screen == 'index') {
		data.title = 'หน้าหลัก';
	}*/

	res.render(data.screen, { data: data });

};