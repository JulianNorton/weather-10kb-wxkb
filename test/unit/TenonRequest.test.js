'use strict';

const TenonRequest = require('../../src/modules/TenonRequest');
const chai = require('chai');
const sinon = require('sinon');
const request = require('request');

const expect = chai.expect;

describe('TenonRequest', () => {
  var tenon;

  beforeEach(() => {
    tenon = new TenonRequest();

    sinon
      .stub(request, 'post')
      .yields(null, null, JSON.stringify({ foo: 'bar' }));
  });

  afterEach(() => {
    request.post.restore();
  });

  const submitTestCases = [
    {
      describe: 'should pass the expected result and no error to callback when given all required parameters',
      options: {
        key: 'abcdef',
        src: '<html></html>'
      },
      expectedError: null,
      expectedResult: { foo: 'bar' }
    },
    {
      describe: 'should pass an error and null result to callback if all required parameters are missing',
      options: { endpoint: 'http://foo' },
      expectedError: 'Some or all required parameters are missing: Please provide 1) key, and 2) src OR uri.',
      expectedResult: null
    },
    {
      describe: 'should pass an error and null result to callback if src or uri is provided, but no key',
      options: { src: '<html></html>' },
      expectedError: 'Some or all required parameters are missing: Please provide 1) key, and 2) src OR uri.',
      expectedResult: null
    },
    {
      describe: 'should pass an error and null result to callback if only the key is provided',
      options: { key: 'abcde' },
      expectedError: 'Some or all required parameters are missing: Please provide 1) key, and 2) src OR uri.',
      expectedResult: null
    },
    {
      describe: 'should pass an error and null result to callback if parameters are null',
      options: null,
      expectedError: 'Please provide a parameters object.',
      expectedResult: null
    },
    {
      describe: 'should pass an error and null result to callback if parameters are of the wrong type',
      options: false,
      expectedError: 'Please provide a parameters object.',
      expectedResult: null
    },
  ];

  submitTestCases.forEach(testCase => {
    it(testCase.describe, (done) => {
      tenon.submit(testCase.options, (error, result) => {
        expect(error).to.equal(testCase.expectedError);
        expect(result).to.eql(testCase.expectedResult);
        done();
      });
    });
  });

  const submitCallbackTestCases = [
    {
      describe: 'should pass the expected error and null result to callback if the request returns an error',
      options: {
        key: 'abcdef',
        src: '<html></html>',
        endpoint: null
      },
      bodyYield: null,
      errorYield: 'error',
      expectedError: 'error',
      expectedResult: null,
    },
    {
      describe: 'should pass the expected error and null result to callback if the response body is not valid JSON',
      options: {
        key: 'abcdef',
        src: '<html></html>',
      },
      bodyYield: 'not json',
      errorYield: null,
      expectedError: 'Failed to parse Tenon.io response body.',
      expectedResult: null,
    },
  ];

  submitCallbackTestCases.forEach(testCase => {
    it(testCase.describe, (done) => {
      request.post.restore();
      sinon
        .stub(request, 'post')
        .yields(testCase.errorYield, null, testCase.bodyYield);

      tenon.submit(testCase.options, (error, result) => {
        expect(error).to.equal(testCase.expectedError);
        expect(result).to.equal(testCase.expectedResult);
        done();
      });
    });
  });

});
