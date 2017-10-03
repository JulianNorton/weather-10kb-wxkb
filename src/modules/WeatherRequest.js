'use strict';

const DarkSky = require('dark-sky');
const nodeFreegeoip = require('node-freegeoip');
const nodeGeocoder = require('node-geocoder');
const moment = require('moment-timezone');
const timezone = require('google-timezone-api');


const geocoder = nodeGeocoder({
  provider: 'google',
  // Optional depending on the providers
  httpAdapter: 'https',  // default
  apiKey: process.env.GOOGLE_API_KEY,
  formatter: null  // 'gpx', 'string', etc.
});

function WeatherRequest(req) {

  function geocodeWithLocation() {
    return geocoder.geocode(req.params.location)
      .then(res => {
        let countryCode = 'US';

        if (res.length) {
          req.params.latitude = res[0].latitude;
          req.params.longitude = res[0].longitude;
          req.params.formatted_location = res[0].formattedAddress;
          req.params.locationSearch = req.params.location;
          countryCode = res[0].countryCode || countryCode;
        } else {
          // TODO: throw exception?
          req.params.latitude = 0;
          req.params.longitude = 0;
        }

        req.params.countryCode = countryCode;
        return countryCode;
      });
  }

  function geocodeWithIp(ip) {
    return new Promise((resolve, reject) => {
      nodeFreegeoip.getLocation(ip, (err, location) => {
        if (err) return reject(err);

        if (location.latitude == 0 && location.longitude == 0) {  // TODO: triple equals?
          return reject(new Error('Unable to determine location based on IP address.'));
        }

        req.params.latitude = location.latitude;
        req.params.longitude = location.longitude;
        req.params.countryCode = location.country_code || 'US';

        // Set the location to coordinates since that's all we have
        req.params.location = req.params.latitude + ',' + req.params.longitude;

        // Something readable to display to the user
        req.params.formatted_location = location.city + ', ' + location.region_code;

        resolve(location.region_code);
      });
    });
  }

  this.geocode = () => {
    return Promise.resolve().then(() => {
      if (typeof req.params.location === 'string') {
        return geocodeWithLocation();
      } else {
        let ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress;
        ip = ip.split(':')[0];  // handle azure-style IP values which include ports
        return geocodeWithIp(ip);
      }
    });
  };

  this.setTimeZone = () => {
    return timezone({ location: req.params.latitude + ',' + req.params.longitude })
      .then(res => {
        req.params.tz = res.timeZoneId;
        moment.tz.setDefault(req.params.tz);
      });
  };

  this.getForecast = () => {
    return new DarkSky(process.env.DARK_SKY_API_KEY)
      .latitude(req.params.latitude)
      .longitude(req.params.longitude)
      .units(req.params.units)
      .exclude('minutely')
      .get();
  };
}


module.exports = WeatherRequest;
