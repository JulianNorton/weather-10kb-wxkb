var express = require('express');
var app = express();

var fs = require('fs'); // this engine requires the fs module

var Weather = require('./node_modules/weather.js');

'use strict';

const ForecastIO = require('forecast-io')
const forecast = new ForecastIO('a7a98d30ab67b8ab1f8fa84273883d98')

app.engine('ntl', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    // this is an extremely simple template engine
    var rendered = content.toString().replace(/{([^}]+)}/g, function( prop_tag, prop_str ) {
      console.log('options.' + prop_str);
      console.log(eval('options.' + prop_str));
      return eval('options.' + prop_str);
    });
    return callback(null, rendered);
  });
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ntl');

app.get('/', function(request, response) {

  forecast
    .latitude('37.8267')
    .longitude('-122.423')
    .get()
    .then(res => {
      //console.log(res);
      response.render('pages/index', JSON.parse(res));
    })
    .catch(err => {                 // handle your error response.
      console.log(err)
    })

});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


