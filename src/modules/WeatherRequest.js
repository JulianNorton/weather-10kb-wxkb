var DarkSky       = require('dark-sky')
var nodeFreegeoip = require('node-freegeoip')
var nodeGeocoder  = require('node-geocoder')
var moment        = require('moment-timezone')
var timezone      = require('google-timezone-api')

function WeatherRequest(request) {
  this.geocode = function() {
    return new Promise(function(resolve, reject) {
      if (typeof request.params.location === 'string') {
        var geocoder = nodeGeocoder({
          provider: 'google',

          // Optional depending on the providers
          httpAdapter: 'https', // Default
          apiKey: process.env.GOOGLE_API_KEY,
          formatter: null         // 'gpx', 'string', ...
        });
        var countryCode = 'US';
        geocoder.geocode(request.params.location)
          .then(function(res) {
            if (res.length) {
              request.params.latitude = res[0].latitude
              request.params.longitude = res[0].longitude
              request.params.formatted_location = res[0].formattedAddress
              request.params.locationSearch = request.params.location;
              countryCode = res[0].countryCode ? res[0].countryCode : 'US';
            } else {
              // TODO throw exception?
              request.params.latitude = 0;
              request.params.longitude = 0;
            }
            request.params.countryCode = countryCode;
            resolve(countryCode);
          })
          .catch(function(err) {
            return reject(err);
          })
      } else {
        var ip = request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(',')[0] : request.connection.remoteAddress

        // handle azure-style ip values which include ports
        ip = ip.split(':')[0]

        nodeFreegeoip.getLocation(ip, function(err, location) {
          if (err) {
            return reject(err);
          }

          if (location.latitude == 0 && location.longitude == 0) {
            return reject(new Error("Unable to determine location based on IP address."));
          }

          request.params.latitude = location.latitude
          request.params.longitude = location.longitude
          request.params.countryCode = location.country_code ? location.country_code : 'US';

          // set the location to coordinates since that's all we have
          request.params.location = request.params.latitude + ',' + request.params.longitude;

          // something readable to display to the user
          request.params.formatted_location = location.city + ', ' + location.region_code

          resolve(location.region_code);
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
      var forecast = new DarkSky(process.env.DARK_SKY_API_KEY);
      var units = request.params.units;

      forecast
        .latitude(request.params.latitude)
        .longitude(request.params.longitude)
        .units(units)
        .exclude('minutely')
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

module.exports = WeatherRequest;
