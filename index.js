var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.set('port', (process.env.PORT || 5000));

// Mongo initialization and connect to database
// process.env.MONGOLAB_URI is the environment variable on Heroku for the MongoLab add-on
// process.env.MONGOHQ_URL is the environment variable on Heroku for the MongoHQ add-on
// If environment variables not found, fall back to mongodb://localhost/nodemongoexample
// nodemongoexample is the name of the database
var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/nodemongoexample';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
/*app.set('views', __dirname + '/views');
app.set('view engine', 'ejs'); */

var vehicleNames = ['JANET','ilFrXqLz', 't4wcLoCT', 'WnVPdTjF', '1fH5MXna', '4aTtB30R', '8CXROgIF', 'w8XMS577', 'ZywrOTLJ', 'cQRzspF5', 'GSXHB9L1', 'TztAkR2g', 'aSOqNo4S', 'ImjNJW4n', 'svEQIneI', 'N10SCqi5', 'QQjjwwH2', 'H0pfmYGr', 'FyUHoAvS', 'bgULOMsX', 'OlOBzZF8', 'Ln7b7ODx', 'ZoxN11Sa', 'itShXf78', 'o6kJKzyI', 'pD0kGOax', 'njr1i7xM', 'wtDRzig8', 'l2r8bViT', 'oZn3b2OZ', 'ym2J1vil'];

app.get('/', function(request, response) {
  //response.render('pages/index');
	//response.sendFile('/index.html');

	response.set('Content-Type', 'text/html');
	var index = '';

	db.collection('passengers', function(error, collection) {
		collection.find().sort({created_at: -1}).toArray(function(error, passengers) {
			if (error) {
				response.send('<!DOCTYPE HTML><html><head><title>ERROR</title></head><body><h1>ERROR getting passenger list</h1></body></html>');
			} else {
				index += '<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/><title>The Black Car Service Passengers</title><link rel="stylesheet" href="style.css" type="text/css"/><link href="https://fonts.googleapis.com/css?family=Dancing+Script|Raleway" rel="stylesheet"/></head><body><div id="header"><div id="header-text"><h1>The Black Car Service Passengers</h1>' + "<h4>Get where you're going in style</h4></div></div>" + '<div id="main-passenger">';
				for (var i = 0; i < passengers.length; i += 1) {
					index += "<p>" + passengers[i].username + " requested a vehicle at " + passengers[i].lat + ", " + passengers[i].lng + " on " + passengers[i].created_at + ".</p>";
				}
				index += '</div></body></html>';
				response.send(index);
			}
		});
	});
});

app.post('/submit', function(request, response) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");

  var type = 'passengers';
  var returnType = 'vehicles';
  var username = request.body.username;
  var lat = request.body.lat;
  var lng = request.body.lng;
  var created_at = new Date();

  if (username && lat && lng) {
    for (var v = 0; v < vehicleNames.length; v += 1) {
    	if (username === vehicleNames[v]) {
    		type = 'vehicles';
    		returnType = 'passengers';
    	}
    }

    db.collection(type, function(error, coll) {
		  if (error) {
		    console.log("Error: " + error);
		  	response.sendStatus(500);		  
		  } else {
			  coll.update(
			  	{ username: username},
			  	{
			  		username: username,
			  		lat: lat,
			  		lng: lng,
			  		created_at: created_at
			  	},
			  	{ upsert: true}
			  );
			}
		});

		db.collection(returnType, function(error, collection) {
			if (error) {
				console.log("Error: " + error);
				response.send(500);
			} else {
				var fiveMinAgo = new Date(created_at - (5 * 60 * 1000));
				collection.find({created_at:{$gte: fiveMinAgo}}).toArray(function(error, users) {
					if (error) {
						console.log("Error: " + error);
						response.send(500);
					} else {
						if (returnType === "passengers") {
							var passengersReturn = {passengers: users};
							response.send(JSON.stringify(passengersReturn));
						} else if (returnType === "vehicles") {
							var vehiclesReturn = {vehicles: users};
							response.send(JSON.stringify(vehiclesReturn));
						}
					}
				});
			}
		});
	/*		  coll.insert(newDocument, function(error, saved) {
			  	if (error) {
			      console.log("Error: " + error);
			  	  response.send(500);
			  	} else {
			  	  response.json({"message": "added!"});
			  	}
		  }); */
  } else {
  	response.json({"error":"Whoops, something is wrong with your data!"});
  }

/*  if (passenger) {
    response.json({"vehicles":[]});
  } */
 // response.json({"passengers":[]});
});

app.get('/vehicle.json', function(request, response) {
  var username = request.query.username;
  if (!username) {
  	response.json({});
  } else {
		db.collection('vehicles', function(error, coll) {
		  if (error) {
		    console.log("Error: " + error);
		  	response.sendStatus(500);		  
		  } else {
				coll.find({username: username}).toArray(function(error, documents) {
				  var document = documents[0];
				  if (document) {
				  	response.json(document);
				  } else {
				  	response.json({});
				  }
				});
			}
	/*		  coll.insert(newDocument, function(error, saved) {
			  	if (error) {
			      console.log("Error: " + error);
			  	  response.send(500);
			  	} else {
			  	  response.json({"message": "added!"});
			  	}
		  }); */
		});
		//response.json({"_id":"589bd30f8451126182dfbc62","username":username,"lat":10.1,"lng":10.2,"created_at":"2017-02-09T02:25:19.575Z"});
  }
  //vehicle = 
  //response.json(vehicle);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


