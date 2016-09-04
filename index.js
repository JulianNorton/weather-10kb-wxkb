var express = require('express');
var fs = require('fs');
var moment = require('moment');
var objectMerge = require('object-merge');

var app = express();

'use strict';

const ForecastIO = require('forecast-io')
const forecast = new ForecastIO('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.locals.moment = moment; // this makes moment available as a variable in every EJS page

app.get('/:lat/:lon/:scale?', function(request, response) {
  var units = 'us';
  var scale = 'F';

  // switch to celsius if required
  if (typeof request.params.scale !== 'undefined') {
    if (request.params.scale === 'c') {
      units = 'si';
      scale = 'C';
    }
  }

  console.log(request.params);
  forecast
    .latitude(request.params.lat)
    .longitude(request.params.lon)
    .units(units)
    .get()
    .then(res => {
      response.render('pages/index', objectMerge(
        JSON.parse(res),
        {
          lat: request.params.lat,
          lon: request.params.lon,
          scale: scale
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


