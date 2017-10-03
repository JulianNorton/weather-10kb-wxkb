'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const moment = require('moment-timezone');
const app = require('../../src/app');


chai.use(chaiHttp);

describe('Forecast location', () => {

  it('should guess the user\'s location based on their IP address', done => {
    chai.request(app)
      .get('/')
      .set('x-forwarded-for', '107.170.145.187')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.include('New York');
        done();
      });
  });

  it('should respond with an error page when given invalid coordinates', done => {
    chai.request(app)
      .get('/8793459834859')
      .end((err, res) => {
        // NOTE: 'Longitute' as misspelled in 'dark-sky' package
        expect(res.text).to.include('ERROR: Longitute or Latitude is missing');
        done();
      });
  });

  it('should set the correct timezone for a location', () => {
    return chai.request(app)
      .get('/New%20York')  // in case location defaults to Los Angeles
      .then(res => {
        expect(res).to.have.status(200);
        expect(moment().tz()).to.equal('America/New_York');
        return chai.request(app).get('/Los%20Angeles');
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(moment().tz()).to.equal('America/Los_Angeles');
      })
      .catch(err => {
        throw err;
      });
  }).timeout(5000);

  it('should display default units based on location', () => {
    return chai.request.agent(app)  // agent retains cookies
      .get('/New%20York')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.text).to.contain('Fahrenheit, imperial (current)');
        expect(res.text).to.match(/[0-9]{1,3}°F/);
        expect(res.text).to.match(/[0-9].+?\smph/);
      })
      .catch(err => {
        throw err;
      });
  });

  const locationTestCases = [
    {
      describe: 'should display forecast for a location by short name',
      parameter: 'NYC',
      expectedLocation: 'New York',
    },
    {
      describe: 'should display forecast for a location by zip code and country',
      parameter: '10115 Germany',
      expectedLocation: 'Berlin',
    },
    {
      describe: 'should display forecast for a location by city',
      parameter: 'Beijing',
      expectedLocation: 'Beijing',
    },
    {
      describe: 'should display forecast for a location by coordinates',
      parameter: '19.433333,-99.133333',
      expectedLocation: 'Ciudad de México',
    },
  ];

  locationTestCases.forEach(testCase => {
    it(testCase.describe, done => {
      chai.request(app)
        .get(`/${testCase.parameter}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include(testCase.expectedLocation);
          done();
        });
    });
  });

});


describe('Forecast units', () => {

  const unitsTestCases = [
    {
      describe: 'should display °C and wind speed as km/h with unit ca selected',
      setting: 'ca',
      currentText: 'Celsius, metric (km/h) (current)',
      expectedTemp: /[0-9]{1,3}°C/,
      expectedSpeed: /[0-9].+?\skm\/h/
    },
    {
      describe: 'should display °C and wind speed as m/s with unit si selected',
      setting: 'si',
      currentText: 'Celsius, metric (m/s) (current)',
      expectedTemp: /[0-9]{1,3}°C/,
      expectedSpeed: /[0-9].+?\sm\/s/
    },
    {
      describe: 'should display °F and wind speed as mph with unit us selected',
      setting: 'us',
      currentText: 'Fahrenheit, imperial (current)',
      expectedTemp: /[0-9]{1,3}°F/,
      expectedSpeed: /[0-9].+?\smph/
    },
    {
      describe: 'should display °C and wind speed as mph with unit uk2 selected',
      setting: 'uk2',
      currentText: 'Celsius, imperial (current)',
      expectedTemp: /[0-9]{1,3}°C/,
      expectedSpeed: /[0-9].+?\smph/
    },
  ];

  unitsTestCases.forEach(testCase => {
    it(testCase.describe, () => {
      return chai.request.agent(app)  // agent retains cookies
        .get(`/New%20York?units=${testCase.setting}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.text).to.contain(testCase.currentText);
          expect(res.text).to.match(testCase.expectedTemp);
          expect(res.text).to.match(testCase.expectedSpeed);
        })
        .catch(err => {
          throw err;
        });
    });
  });

});
