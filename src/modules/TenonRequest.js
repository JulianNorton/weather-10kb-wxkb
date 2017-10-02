'use strict';

const request = require('request');
const tenonEndpoint = 'https://tenon.io/api/';
const defaultOptions = {
  endpoint: tenonEndpoint
};

/**
 * Send requests to the tenon.io API for automated accessibility testing.
 */
function TenonRequest() {
  /**
   * Submit a tenon.io request to the given endpoint.
   * Results are expected to be handled by a callback.
   *
   * Params can be any valid tenon.io request parameters.
   * key and either src or uri are required.
   * @see https://tenon.io/documentation/understanding-request-parameters.php
   *
   * @param {object} params
   * @param {function} callback
   */
  this.submit = (params, callback) => {
    try {
      params = this.validate(params);
    } catch (error) {
      return callback(error, null);
    }

    request.post(params.endpoint, { form: params }, (error, response, body) => {
      if (error) {
        return callback(error, null);
      }

      let result;

      try {
        result = JSON.parse(body);
      } catch (error) {
        error = 'Failed to parse Tenon.io response body: ' + error;
      }

      return callback(error, result);
    });
  }

  /**
   * Check if options is a valid object with the required parameters. Set defaults where applicable.
   *
   * @param {object} options
   *
   * @return {object}
   */
  this.validate = (options) => {
    if (options === null || typeof options !== 'object') {
      throw 'Please provide a parameters object.';
    }

    if (!('key' in options) || (!('src' in options) && !('uri' in options))) {
      throw 'Some of the required parameters were missing: 1) key, and 2) src OR uri.';
    }

    if (!('endpoint' in options) || options.endpoint === null) {
      options.endpoint = tenonEndpoint;
    }

    return options;
  }
}

module.exports = TenonRequest;
