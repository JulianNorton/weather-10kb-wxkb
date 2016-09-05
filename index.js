var express = require('express');
var favicon = require('serve-favicon');
var forecastIO = require('forecast-io')        // coordinate-based forecast
var freegeoip = require('node-freegeoip');     // ip-based geolocation
var nodeGeocoder = require('node-geocoder');   // string-based geolocation e.g. "new york"
var moment = require('moment-timezone');       // localize times in the forecast
var objectMerge = require('object-merge');
var timezone = require('google-timezone-api'); // coordinate-based timezone

var forecast = new forecastIO(process.env.FORECAST_IO_API_KEY)

var app = express();

var locateCtrl = function(request, response, next) {

  // if we receieved a location, geocode coordinates from it
  if (typeof request.params.location === 'string') {

    var geocoder = nodeGeocoder()

    geocoder.geocode(request.params.location)
      .then(function(res) {
        console.log(res);
        request.params.lat = res[0].latitude;
        request.params.lon = res[0].longitude;
        return next();
      })
      .catch(function(err) {
        console.log(err);
        response.status(500).send('The location you entered (' + request.params.location + ') could not be geocoded.');
      });

  // otherwise guess coordinates based on ip
  } else {

    var ip = request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(',')[0] : request.connection.remoteAddress;

    freegeoip.getLocation(ip, function(err, location) {
      if (err) {
        console.log(err);
        response.status(500).send('Could not determine your location based on your IP (' + ip + ').');
      } else {
        console.log(location);
        request.params.lat = location.latitude;
        request.params.lon = location.longitude;
        // let's just get the tz when we render the forecast to make things simpler
        request.params.tz = location.time_zone; // passed to forecastCtrl via next(), but not a real param otherwise
        return next();
      }
    });

  }

}

var forecastCtrl = function(request, response) {

  var units = (typeof request.params.scale === 'string' && request.params.scale === 'C') ? 'si' : 'us';

  if (typeof request.params.tz !== 'string') {

    moment.tz.setDefault(request.params.tz);

  } else {

    timezone({location: request.params.lat + ',' + request.params.lon})
      .then(function(res) {
        console.log(res);
        request.params.tz = res.timeZoneId;
        moment.tz.setDefault(request.params.tz);
      }).catch( function(err) {
        console.log(err);
        // timezone will be wrong if this happened, but that's not a dealbreaker so go ahead and render the forecast.
        // TODO some kind of message explaining why they times are wrong might be nice.
      });

  }

  forecast
    .latitude(request.params.lat)
    .longitude(request.params.lon)
    .units(units)
    .get()
    .then(res => {
      response.render('pages/index', objectMerge(
        JSON.parse(res),
        {
          scale: (units === 'si') ? 'C' : 'F',
          params: request.params
        }
      ));
    })
    .catch(err => {
      console.log(err)
      // TODO display message to user
    })

}

app.locals.moment = moment;

app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/:location?', locateCtrl, forecastCtrl);
app.get('/:lat/:lon/:scale?', forecastCtrl);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
