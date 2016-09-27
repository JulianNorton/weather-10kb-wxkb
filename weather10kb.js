var express       = require('express');
var forecastIo    = require('forecast-io')
var nodeFreegeoip = require('node-freegeoip')
var nodeGeocoder  = require('node-geocoder')
  var options = {
    provider: 'google',
   
    // Optional depending on the providers 
    httpAdapter: 'https', // Default 
    apiKey: process.env.GOOGLE_API_KEY,
    formatter: null         // 'gpx', 'string', ... 
  };
var moment        = require('moment-timezone')
var objectMerge   = require('object-merge')
var timezone      = require('google-timezone-api')

/* opbeat test */
var opbeat = require('opbeat').start({
  appId: 'b7e850139c',
  organizationId: 'f247396b8206495081b3ee68cd26deff',
  secretToken: 'fd17a0a75d8fcab560de39bfceb8c75d80d2ceaf'
})
            
var router = express.Router();

function Weather10kbRequest(request) {
  this.geocode = function() {
    return new Promise(function(resolve, reject) {
      if (typeof request.params.location === 'string') {
        var geocoder = nodeGeocoder();

        geocoder.geocode(request.params.location)
          .then(function(res) {
            if (res.length) {
              request.params.latitude = res[0].latitude
              request.params.longitude = res[0].longitude
              request.params.formatted_location = res[0].formattedAddress
            } else {
              // TODO throw exception?
              request.params.latitude = 0;
              request.params.longitude = 0;
            }
            resolve();
          })
          .catch(function(err) {
            return reject(err);
          })
      } else {
        var ip = request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(',')[0] : request.connection.remoteAddress

        nodeFreegeoip.getLocation(ip, function(err, location) {
          if (err) {
            return reject(err);
          }

          if (location.latitude == 0 && location.longitude == 0) {
            return reject(new Error("Unable to determine location based on IP address."));
          }

          request.params.latitude = location.latitude
          request.params.longitude = location.longitude

          // set the location to coordinates since that's all we have
          request.params.location = request.params.latitude + ',' + request.params.longitude;

          // something readable to display to the user
          request.params.formatted_location = location.region_name + ', ' + location.region_code

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
  // validate
  (function() {
    // check for & handle a querystring variable in case the user submitted the location form rather than passing a url param
    if (typeof request.query.location === 'string') {
      response.redirect('/' + request.query.location);
    }

    // if we got a scale and not a location for the first param, adjust params accordingly
    if (typeof request.params.location === 'string' && request.params.location.toUpperCase() in ['C', 'F']) {
      request.params.scale = request.params.location;
      delete request.params.location;
    }

    if (typeof request.params.scale === 'string') {
      request.params.scale = request.params.scale.toUpperCase();
    } else {
      request.params.scale = 'F';
    }

    request.params.units = (typeof request.params.scale === 'string' && request.params.scale === 'C') ? 'si' : 'us'
  })();

  var wr = new Weather10kbRequest(request);

  wr.geocode()
    .then(wr.setTimeZone)
    .then(wr.getForecast)
    .then(function(data) {
      if (typeof request.params.formatted_location === 'undefined' || request.params.formatted_location == ', ') {
        request.params.formatted_location = request.params.location;
      }

      // remove extraneous country info if present
      request.params.formatted_location = request.params.formatted_location.replace(/, USA/, '')

      if (request.params.longitude == 0 && request.params.latitude == 0) {
        throw 'Undetermined location.';
      }

      response.render('pages/index', objectMerge(JSON.parse(data), {params: request.params}));
    })
    .catch(function(err){
      if (err instanceof Error) {
        var err_msg = err.toString();
      } else {
        var err_msg = JSON.stringify(err);
      }

      response.render('pages/error', {error: err_msg});
    });
});

module.exports = router;
