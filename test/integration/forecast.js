'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

const app = require('../../src/app');

// Test data for location-based forecast
const locationTestCases = [
  {
    'describe': 'should display forecast for a location by short name',
    'parameter': 'NYC',
    'expectedLocation': 'New York',
  },
  {
    'describe': 'should display forecast for a location by zip code and country',
    'parameter': '10115 Germany',
    'expectedLocation': 'Berlin',
  },
  {
    'describe': 'should display forecast for a location by city',
    'parameter': 'Beijing',
    'expectedLocation': 'Beijing',
  },
  {
    'describe': 'should display forecast for a location by coordinates',
    'parameter': '19.433333,-99.133333',
    'expectedLocation': 'Ciudad de México',
  },
];

// Test data for temp/wind unit settings
const unitsTestCases = [
  {
    'describe': 'should display °C and wind speed as km/h with unit ca selected',
    'setting': 'ca',
    'currentText': 'Celsius, metric (km/h) (current)',
    'expectedTemp': /[0-9]{1,3}°C/,
    'expectedSpeed': /[0-9].+?\skm\/h/
  },
  {
    'describe': 'should display °C and wind speed as m/s with unit si selected',
    'setting': 'si',
    'currentText': 'Celsius, metric (m/s) (current)',
    'expectedTemp': /[0-9]{1,3}°C/,
    'expectedSpeed': /[0-9].+?\sm\/s/
  },
  {
    'describe': 'should display °F and wind speed as mph with unit us selected',
    'setting': 'us',
    'currentText': 'Fahrenheit, imperial (current)',
    'expectedTemp': /[0-9]{1,3}°F/,
    'expectedSpeed': /[0-9].+?\smph/
  },
  {
    'describe': 'should display °C and wind speed as mph with unit uk2 selected',
    'setting': 'uk2',
    'currentText': 'Celsius, imperial (current)',
    'expectedTemp': /[0-9]{1,3}°C/,
    'expectedSpeed': /[0-9].+?\smph/
  },
];

describe('Forecast', function () {

  it('should guess the user’s location based on their IP address', function (done) {
    chai.request(app)
      .get('/')
      .set('x-forwarded-for', '107.170.145.187')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.text).to.include('New York');
        done();
      });
  });

  it('should respond with an error page when given invalid coordinates', function (done) {
    chai.request(app)
      .get('/8793459834859')
      .end(function (err, res) {
        expect(res.text).to.include('ERROR: Longitute or Latitude is missing');
        done();
      });
  });

  it('should display default units based on location', function () {
    let agent = chai.request.agent(app)
    return agent
      .get('/New%20York')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.text).to.contain('Fahrenheit, imperial (current)');
        expect(res.text).to.match(/[0-9]{1,3}°F/);
        expect(res.text).to.match(/[0-9].+?\smph/);
      })
      .catch(function (err) {
        throw err;
      });
  });

  function testLocations(testCase) {
    it(testCase.describe, function (done) {
      chai.request(app)
        .get(`/${testCase.parameter}`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.text).to.include(testCase.expectedLocation);
          done();
        });
    });
  }

  locationTestCases.forEach(function (testCase) {
    testLocations(testCase);
  });

  function testUnitSettings(testCase) {
    it(testCase.describe, function () {
      // Using agent to persist the cookie during redirect.
      let agent = chai.request.agent(app);
      return agent
        .get(`/New%20York?units=${testCase.setting}`)
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res.text).to.contain(testCase.currentText);
          expect(res.text).to.match(testCase.expectedTemp);
          expect(res.text).to.match(testCase.expectedSpeed);
        })
        .catch(function (err) {
          throw err;
        });
    });
  }

  unitsTestCases.forEach(function (testCase) {
    testUnitSettings(testCase);
  });

});
