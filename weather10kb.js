/* Opbeat has to be on top */
/* ~100 bytes additional on requests */
var opbeat        = require('opbeat').start()
var express       = require('express')
var DarkSky       = require('dark-sky')
var nodeFreegeoip = require('node-freegeoip')
var nodeGeocoder  = require('node-geocoder')
var moment        = require('moment-timezone')
var objectMerge   = require('object-merge')
var timezone      = require('google-timezone-api')


var router = express.Router()


function Weather10kbRequest(request) {
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

router.get('/:location?', function(request, response) {
  const prefsCookie = 'wxkb_preferences';
  request.params.units = 'auto';
  request.params.locationSearch  = null;

  // Dark Sky units with their wind speed measurements
  // TODO: Read from config file?
  const defaultUnits = {
    ca: {
      scale: 'C',
      speed: 'km/h',
      desc: 'Celsius, metric (km/h)'
    },
    si: {
      scale: 'C',
      speed: 'm/s',
      desc: 'Celsius, metric (m/s)'
    },
    us: {
      scale: 'F',
      speed: 'mph',
      desc: 'Fahrenheit, imperial'
    },
    uk2: {
      scale: 'C',
      speed: 'mph',
      desc: 'Celsius, imperial'
    },
  };

  // Codes of countries mostly using 12-hour clock
  const twelveHourTime = ['AU', 'CA', 'CO', 'EG', 'IN', 'MY', 'NZ', 'PH', 'PK', 'SA', 'UK', 'US', 'VN'];

  // validate
    // check for & handle a querystring variable in case the user submitted the location form rather than passing a url param
    if (typeof request.query.location === 'string') {
      return response.redirect('/' + encodeURIComponent(request.query.location));
    }

    // Check for a cookie with units value
    var prefsCookiePrev;
    if (prefsCookie in request.cookies
      && typeof request.cookies[prefsCookie] === 'object'
      && 'units' in request.cookies[prefsCookie]
      && request.cookies[prefsCookie].units in defaultUnits) {
      request.params.units = request.cookies[prefsCookie].units;
      prefsCookiePrev = request.cookies[prefsCookie];
    }

    // Check query string variable for switching units
    if (typeof request.query.units === 'string' && request.query.units.toLowerCase() in defaultUnits) {
      request.params.units = request.query.units;

      // Update preferences cookie or create a new one
      response.cookie(prefsCookie, objectMerge(prefsCookiePrev, {units: request.params.units}), {expires: 0});

      // Redirect to remove units query string from URL
      var locParam = '';
      if (typeof request.params.location === 'string') {
        locParam = encodeURIComponent(request.params.location);
      } else if (typeof request.query.location === 'string') {
        locParam = '?location=' + encodeURIComponent(request.query.location);
      }

      return response.redirect('/' + locParam);
    }

    // check for & handle a querystring variable in case the user submitted the location/units form rather than passing a url param
    if (typeof request.query.location === 'string') {
      return response.redirect('/' + encodeURIComponent(request.query.location));
    }

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

      var args = objectMerge(data, {params: request.params});

      // Default wind speed unit
      args.params.windUnit = 'km/h';

      // List of available units
      args.params.defaultUnits = defaultUnits;

      // Set default units based on the units flag used in the forecast response
      if (typeof args.flags.units === 'string' && args.flags.units !== '') {
        args.params.units = args.flags.units;
        args.params.scale = args.params.units === 'us' ? 'F' : 'C';
        args.params.windUnit = defaultUnits[args.params.units].speed;
      }

      // Set format string for hours based on the most common clock format fo the current location
      args.params.hoursFormat = twelveHourTime.indexOf(request.params.countryCode) > -1 ? 'h' : 'H';

      return response.render('pages/index', args);
    })
    .catch(function(err){
      if (err instanceof Error) {
        var err_msg = err.toString();
      } else {
        var err_msg = JSON.stringify(err);
      }

      return response.render('pages/error', {error: err_msg});
    });
});

module.exports = router;
