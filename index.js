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

app.get('/:lat?/:lon?/:scale?', function(request, response) {
  var geo = geoip.lookup(request.ip);

  var lat = request.params.lat || geo.ll[0];
  var lon = request.params.lon || geo.ll[1];

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


