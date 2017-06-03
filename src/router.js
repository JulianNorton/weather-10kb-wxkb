'use strict';

// Opbeat has to be on top
// ~100 bytes additional on requests
const opbeat = require('opbeat').start();
const express = require('express');
const objectMerge = require('object-merge');
const WeatherRequest = require('./modules/WeatherRequest');
const { cookieName, defaultUnits } = require('./config.json');
const { getPrevCookie } = require('./routerHelper');


const TWELVE_HOUR_COUNTRIES = new Set(['AU', 'CA', 'CO', 'EG', 'IN', 'MY', 'NZ', 'PH', 'PK', 'SA', 'UK', 'US', 'VN']);

const router = express.Router();

router.get('/:location?', (req, res) => {
  req.params.units = 'auto';
  req.params.locationSearch = null;

  // Check for and handle a query string variable in case the user submitted the location form rather than passing a URL param
  if (typeof req.query.location === 'string') {
    return res.redirect('/' + encodeURIComponent(req.query.location));
  }

  // Check for a cookie with units value
  const prefsCookiePrev = getPrevCookie(req, cookieName);
  if (prefsCookiePrev) {
    req.params.units = prefsCookiePrev.units;
  }

  // Check query string variable for switching units
  if (typeof req.query.units === 'string' && req.query.units.toLowerCase() in defaultUnits) {
    req.params.units = req.query.units;

    // Update preferences cookie or create a new one
    res.cookie(cookieName, objectMerge(prefsCookiePrev, { units: req.params.units }), { expires: 0 });

    // Redirect to remove units query string from URL
    let locParam = '';
    if (typeof req.params.location === 'string') {
      locParam = encodeURIComponent(req.params.location);
    } else if (typeof req.query.location === 'string') {
      locParam = '?location=' + encodeURIComponent(req.query.location);
    }

    return res.redirect('/' + locParam);
  }

  const wr = new WeatherRequest(req);

  wr.geocode()
    .then(wr.setTimeZone)
    .then(wr.getForecast)
    .then(resData => {
      if (typeof req.params.formatted_location === 'undefined' || req.params.formatted_location === ', ') {
        req.params.formatted_location = req.params.location;
      }

      // Remove extraneous country info if present
      req.params.formatted_location = req.params.formatted_location.replace(/, USA/, '');

      if (req.params.longitude == 0 && req.params.latitude == 0) {  // TODO: triple equals?
        throw 'Undetermined location.';
      }

      const args = objectMerge(resData, { params: req.params });

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
      args.params.hoursFormat = TWELVE_HOUR_COUNTRIES.has(req.params.countryCode) ? 'h' : 'H';
      return res.render('pages/index', args);
    })
    .catch(err => {
      const error = err instanceof Error ? err.toString() : JSON.stringify(err);
      return res.render('pages/error', { error });
    });
  
});


module.exports = router;