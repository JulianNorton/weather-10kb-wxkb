var express = require('express');
var geoip = require('geoip-lite');
var moment = require('moment');
var objectMerge = require('object-merge');

var app = express();

'use strict';

const ForecastIO = require('forecast-io')
const forecast = new ForecastIO(process.env.FORECAST_IO_API_KEY)

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.locals.moment = moment; // this makes moment available as a variable in every EJS page

// if we were not provided coordinates, geolocate based on ip & redirect
app.get('/', function(request, response) {
  var ip = request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(',')[0] : request.connection.remoteAddress;
  var geo = geoip.lookup(ip);

  if (geo && 'll' in geo) {
    var lat = geo.ll[0];
    var lon = geo.ll[1];

    response.redirect('/' + lat + '/' + lon);
  } else {
    response.status(500).send('Could not determine your location based on your IP (' + ip + ').');
  }
});

// if we got coordinates, fetch & render the forecast
app.get('/:lat/:lon/:scale?', function(request, response) {
  var lat = request.params.lat;
  var lon = request.params.lon;
  var units = (typeof request.params.scale === 'string' && request.params.scale === 'C') ? 'si' : 'us';

  forecast
    .latitude(lat)
    .longitude(lon)
    .units(units)
    .get()
    .then(res => {
      response.render('pages/index', objectMerge(
        JSON.parse(res),
        {
          scale: (units === 'si') ? 'C' : 'F'
        }
      ));
    })
    .catch(err => {
      console.log(err)
    })

});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


