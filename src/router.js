/* Opbeat has to be on top */
/* ~100 bytes additional on requests */
const opbeat         = require('opbeat').start()
const express        = require('express')
const objectMerge    = require('object-merge')
const WeatherRequest = require('./modules/WeatherRequest');

const router = express.Router()

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

  let wr = new WeatherRequest(request);

  wr.geocode()
    .then(wr.setTimeZone)
    .then(wr.getForecast)
    .then(function(responseData) {

      if (typeof request.params.formatted_location === 'undefined' || request.params.formatted_location == ', ') {
        request.params.formatted_location = request.params.location;
      }

      // remove extraneous country info if present
      request.params.formatted_location = request.params.formatted_location.replace(/, USA/, '')

      // console.log(responseData);

      if (request.params.longitude == 0 && request.params.latitude == 0) {
        throw 'Undetermined location.';
      }

      let args = objectMerge(responseData, {params: request.params});

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
