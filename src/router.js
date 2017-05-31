'use strict';

// Opbeat has to be on top
// ~100 bytes additional on requests
const opbeat         = require('opbeat').start();
const express        = require('express');
const objectMerge    = require('object-merge');
const WeatherRequest = require('./modules/WeatherRequest');
const defaultUnits   = require('./units.json');


const router = express.Router();

router.get('/:location?', (request, response) => {
  const prefsCookie = 'wxkb_preferences';
  request.params.units = 'auto';
  request.params.locationSearch = null;

  // Codes of countries mostly using 12-hour clock
  const twelveHourTime = ['AU', 'CA', 'CO', 'EG', 'IN', 'MY', 'NZ', 'PH', 'PK', 'SA', 'UK', 'US', 'VN'];

  // Validate
  // Check for and handle a query string variable in case the user submitted the location form rather than passing a URL param
  if (typeof request.query.location === 'string') {
    return response.redirect('/' + encodeURIComponent(request.query.location));
  }

  // Check for a cookie with units value
  let prefsCookiePrev;
  if (prefsCookie in request.cookies && typeof request.cookies[prefsCookie] === 'object'
   && 'units' in request.cookies[prefsCookie] && request.cookies[prefsCookie].units in defaultUnits)
  {
    request.params.units = request.cookies[prefsCookie].units;
    prefsCookiePrev = request.cookies[prefsCookie];
  }

  // Check query string variable for switching units
  if (typeof request.query.units === 'string' && request.query.units.toLowerCase() in defaultUnits) {
    request.params.units = request.query.units;

    // Update preferences cookie or create a new one
    response.cookie(prefsCookie, objectMerge(prefsCookiePrev, { units: request.params.units }), { expires: 0 });

    // Redirect to remove units query string from URL
    let locParam = '';
    if (typeof request.params.location === 'string') {
      locParam = encodeURIComponent(request.params.location);
    } else if (typeof request.query.location === 'string') {
      locParam = '?location=' + encodeURIComponent(request.query.location);
    }

    return response.redirect('/' + locParam);
  }

  const wr = new WeatherRequest(request);

  wr.geocode()
    .then(wr.setTimeZone)
    .then(wr.getForecast)
    .then(responseData => {
      if (typeof request.params.formatted_location === 'undefined' || request.params.formatted_location === ', ') {
        request.params.formatted_location = request.params.location;
      }

      // Remove extraneous country info if present
      request.params.formatted_location = request.params.formatted_location.replace(/, USA/, '');

      if (request.params.longitude == 0 && request.params.latitude == 0) {  // TODO: triple equals?
        throw 'Undetermined location.';
      }

      const args = objectMerge(responseData, {params: request.params});

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

      // Set format string for hours based on the most common clock format of the current location
      args.params.hoursFormat = twelveHourTime.indexOf(request.params.countryCode) > -1 ? 'h' : 'H';
      return response.render('pages/index', args);
    })
    .catch(err => {
      const error = err instanceof Error ? err.toString() : JSON.stringify(err);
      return response.render('pages/error', { error });
    });
  
});


module.exports = router;