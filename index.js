var express = require('express');
var fs = require('fs');
var moment = require('moment');
var objectMerge = require('object-merge');

<<<<<<< HEAD
=======
var app = express();

>>>>>>> origin/master
'use strict';

const ForecastIO = require('forecast-io')
const forecast = new ForecastIO('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.locals.moment = moment; // this makes moment available as a variable in every EJS page

app.get('/', function(request, response) {

  forecast
    .latitude('37.8267') // TODO dynamic
    .longitude('-122.423')
    .get()
    .then(res => {
      response.render('pages/index', objectMerge(
        JSON.parse(res),
        {scale: 'F'}
      ));
    })
    .catch(err => {
      console.log(err)
    })

});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


