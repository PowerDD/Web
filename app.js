var http = require('http')
	, express = require('express')
	, favicon = require('serve-favicon')
	, fs = require('fs')
	, path = require('path')
	, methodOverride = require('method-override')
	, bodyParser = require('body-parser')
	, errorHandler = require('errorhandler')
	, routes = require('./routes')
	, cookieParser = require('cookie-parser')
	, router = express.Router();
	
var app = express();

app.set('port', 8999);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/favicon.ico'));
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(router);

/*app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});*/

if ('development' == app.get('env')) {
	app.use(errorHandler());
}

app.get('*', function(req, res) {
	//## Initial Data ##//
	data = {};
	data.screen = 'index';
	data.shop = '09A3C5B1-EBF7-443E-B620-48D3B648294E'; //process.env.Shop;
	data.apiUrl = 'http://api-test.powerdd.com'; //process.env.API_URL;
	data.apiKey = 'ABCDEFGH-1111-2222-33333-TSETIPA'; //process.env.ApiKey;
	data.websiteUrl = process.env.Website_URL;
	data.categorySelected = '';
	data.Moment = require('moment');


	var url = req.headers['x-original-url'];//.split('/');
	//url = url.filter(function(n){ return n !== ''; });

	if ( url.length >= 1 ) {
		data.screen = url[0];
		fs.exists('./views/'+data.screen+'.jade', function (exists) {
			if (exists) {
				fs.exists('./public/javascripts/'+data.screen+'.js', function (exists) {
					data.script = (exists) ? '/javascripts/'+data.screen+'.js' : '';
					data.subUrl = (url.length == 1 ) ? '' : url[1];
					routes.index(req, res, data);
				});
			}
			else {
				routes.index(req, res, data);
			}
		});
	}
	else {
		routes.index(req, res, data);
	}

});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
