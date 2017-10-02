'use strict';

const TenonRequest = require('../../src/modules/TenonRequest');
const chai = require('chai');
const sinon = require('sinon');
const request = require('request');

const expect = chai.expect;

describe('TenonRequest', () => {
  const expected = {foo: 'bar'};

  before(() => {
    sinon
      .stub(request, 'post')
      .yields(null, null, JSON.stringify(expected));
  });

  after(() => {
    request.post.restore();
  });

  it('should pass the expected result and no error to callback when given all required parameters', (done) => {
    const options = {
      key: 'abcdef',
      src: '<html></html>'
    }

    const tenon = new TenonRequest();

    tenon.submit(options, (error, result) => {
      expect(error).to.equal(null);
      expect(result).to.eql(expected);
      done();
    });
  });

  it('should pass an error and null result to callback if required parameters are missing', (done) => {
    const tenon = new TenonRequest();

    tenon.submit({}, (error, result) => {
      expect(error).to.equal('Some of the required parameters were missing: 1) key, and 2) src OR uri.');
      expect(result).to.equal(null);
      done();
    });
  });

  it('should pass an error and null result to callback if parameters are null or not an object', (done) => {
    const tenon = new TenonRequest();

    tenon.submit(null, (error, result) => {
      expect(error).to.equal('Please provide a parameters object.');
      expect(result).to.equal(null);
      done();
    });
  });
});
