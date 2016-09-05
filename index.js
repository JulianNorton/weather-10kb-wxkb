var express = require('express');
var freegeoip = require('node-freegeoip');
var moment = require('moment-timezone');
var objectMerge = require('object-merge');
var forecastIO = require('forecast-io')

var forecast = new forecastIO(process.env.FORECAST_IO_API_KEY)
// var favicon = require('serve-favicon');

var app = express();

var locateCtrl = function(request, response, next) {
  var ip = request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(',')[0] : request.connection.remoteAddress;
  ip = '74.73.231.129';
  var geo = freegeoip.getLocation(ip, function(err, location) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not determine your location based on your IP (' + ip + ').');
    } else {
      console.log(location);
      request.params.lat = location.latitude;
      request.params.lon = location.longitude;
      request.params.tz = location.time_zone;

      //response.redirect('/' + lat + '/' + lon);
      return next();
    }
  });

}

var forecastCtrl = function(request, response) {
  var lat = request.params.lat;
  var lon = request.params.lon;
  var units = (typeof request.params.scale === 'string' && request.params.scale === 'C') ? 'si' : 'us';

  moment.tz.setDefault(request.params.tz);

  forecast
    .latitude(lat)
    .longitude(lon)
    .units(units)
    .get()
    .then(res => {
      response.render('pages/index', objectMerge(
        JSON.parse(res),
        {
          scale: (units === 'si') ? 'C' : 'F',
          timezone: request.params.tz
        }
      ));
    })
    .catch(err => {
      console.log(err)
    })

}

app.locals.moment = moment;

// trying to get favicon served
// app.use(favicon(__dirname + 'public/favicon.ico'));
app.use(express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', locateCtrl, forecastCtrl);
app.get('/:lat/:lon/:scale?', forecastCtrl);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
