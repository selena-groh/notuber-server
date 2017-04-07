var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
/*app.set('views', __dirname + '/views');
app.set('view engine', 'ejs'); */

app.get('/', function(request, response) {
  //response.render('pages/index');
  response.sendFile('/index.html');
});

app.post('/submit', function(request, response) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");

  var username = request.query.username;
  var lat = request.query.lat;
  var lng = request.query.lng;

  if (!username || !lat || !lng) {
  	response.json({"error":"Whoops, something is wrong with your data!"});
  }

/*  if (passenger) {
    response.json({"vehicles":[]});
  } */
  response.json({"passengers":[]});
});

app.get('/vehicle.json', function(request, response) {
  var username = request.query.username;
  if (!username) {
  	response.json({});
  } else {
	response.json({"_id":"589bd30f8451126182dfbc62","username":username,"lat":10.1,"lng":10.2,"created_at":"2017-02-09T02:25:19.575Z"});
  }
  //vehicle = 
  //response.json(vehicle);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


