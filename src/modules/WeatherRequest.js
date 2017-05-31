'use strict';

const DarkSky       = require('dark-sky');
const nodeFreegeoip = require('node-freegeoip');
const nodeGeocoder  = require('node-geocoder');
const moment        = require('moment-timezone');
const timezone      = require('google-timezone-api');


function WeatherRequest(request) {
  this.geocode = () => {
    return new Promise((resolve, reject) => {
      if (typeof request.params.location === 'string') {
        const geocoder = nodeGeocoder({
          provider: 'google',
          // Optional depending on the providers
          httpAdapter: 'https',  // default
          apiKey: process.env.GOOGLE_API_KEY,
          formatter: null  // 'gpx', 'string', etc.
        });

        geocoder.geocode(request.params.location)
          .then(res => {
            let countryCode = 'US';

            if (res.length) {
              request.params.latitude = res[0].latitude;
              request.params.longitude = res[0].longitude;
              request.params.formatted_location = res[0].formattedAddress;
              request.params.locationSearch = request.params.location;
              countryCode = res[0].countryCode || countryCode;
            } else {
              // TODO: throw exception?
              request.params.latitude = 0;
              request.params.longitude = 0;
            }

            request.params.countryCode = countryCode;
            resolve(countryCode);
          })
          .catch(err => reject(err));
      } else {
        let ip = request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(',')[0] : request.connection.remoteAddress;

        // Handle azure-style IP values which include ports
        ip = ip.split(':')[0];

        nodeFreegeoip.getLocation(ip, function(err, location) {
          if (err) return reject(err);

          if (location.latitude == 0 && location.longitude == 0) {  // TODO: triple equals?
            return reject(new Error('Unable to determine location based on IP address.'));
          }

          request.params.latitude = location.latitude;
          request.params.longitude = location.longitude;
          request.params.countryCode = location.country_code || 'US';

          // Set the location to coordinates since that's all we have
          request.params.location = request.params.latitude + ',' + request.params.longitude;

          // Something readable to display to the user
          request.params.formatted_location = location.city + ', ' + location.region_code;

          resolve(location.region_code);
        })
      }
    });
  };

  this.setTimeZone = () => {
    return new Promise((resolve, reject) => {
      timezone({ location: request.params.latitude + ',' + request.params.longitude })
        .then(res => {
          request.params.tz = res.timeZoneId;
          moment.tz.setDefault(request.params.tz);
          resolve();
        })
        .catch(err => reject(err));
    });
  };

  this.getForecast = () => {
    return new Promise((resolve, reject) => {
      const forecast = new DarkSky(process.env.DARK_SKY_API_KEY);
      const units = request.params.units;

      forecast
        .latitude(request.params.latitude)
        .longitude(request.params.longitude)
        .units(units)
        .exclude('minutely')
        .get()
        .then(res => {
          resolve(res);
        })
        .catch(err => reject(err));
    });
  };
}


module.exports = WeatherRequest;