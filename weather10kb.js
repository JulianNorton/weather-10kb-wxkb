var express       = require('express');
var forecastIo    = require('forecast-io')
var nodeFreegeoip = require('node-freegeoip')
var nodeGeocoder  = require('node-geocoder')
var moment        = require('moment-timezone')
var objectMerge   = require('object-merge')
var timezone      = require('google-timezone-api')

var router = express.Router();

function Weather10kbRequest(request) {
  this.geocode = function() {
    return new Promise(function(resolve, reject) {
      if (typeof request.params.location === 'string') {
        var geocoder = nodeGeocoder();

        geocoder.geocode(request.params.location)
          .then(function(res) {
            request.params.latitude = res[0].latitude
            request.params.longitude = res[0].longitude
            resolve(request.params);
          })
          .catch(function(err) {
            return reject(err);
          })
      } else {
        var ip = request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(',')[0] : request.connection.remoteAddress

        nodeFreegeoip.getLocation(ip, function(err, location) {
          if (err) return reject(err);
          request.params.latitude = location.latitude
          request.params.longitude = location.longitude
          resolve();
        })
      }
    });
  }

  this.setTimeZone = function() {
    return new Promise(function(resolve, reject) {
      timezone({location: request.params.latitude + ',' + request.params.longitude})
        .then(function(res) {
          request.params.tz = res.timeZoneId
          moment.tz.setDefault(request.params.tz)
          resolve();
        })
        .catch(function(err) {
          return reject(err);
        });
    });
  }

  this.getForecast = function() {
    return new Promise(function(resolve, reject) {
      var forecast = new forecastIo(process.env.FORECAST_IO_API_KEY);
      var units = (typeof request.params.scale === 'string' && request.params.scale === 'C') ? 'si' : 'us'

      forecast
        .latitude(request.params.latitude)
        .longitude(request.params.longitude)
        .units(units)
        .get()
        .then(function(res) {
          resolve(res);
        })
        .catch(function(err) {
          return reject(err);
        });
    });
  }

}

router.get('/:location?/:scale?', function(request, response) {
  // if we got a scale and not a location for the first param, adjust params accordingly
  // TODO this should probably live in a validation function
  if (typeof request.params.location === 'string' && request.params.location.toUpperCase() in ['C', 'F']) {
    request.params.scale = request.params.location;
    delete request.params.location;
  }

  // TODO yet more validation
  if (typeof request.params.scale === 'string') {
    request.params.scale = request.params.scale.toUpperCase();
  } else {
    request.params.scale = 'F';
  }

  // TODO more validation to consolidate
  request.params.units = (typeof request.params.scale === 'string' && request.params.scale === 'C') ? 'si' : 'us'

  var wr = new Weather10kbRequest(request);

  wr.geocode()
    .then(wr.setTimeZone)
    .then(wr.getForecast)
    .then(function(data) {
      response.render('pages/index', objectMerge(JSON.parse(data), {params: request.params}));
    })
    .catch(function(err){
      // TODO pretty clientside error handling
      console.log(err);
      response.send(JSON.stringify(err));
    });
});

module.exports = router;
