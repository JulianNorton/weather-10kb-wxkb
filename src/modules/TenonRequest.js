/**
 * A module for sending requests to the tenon.io API (automated accessibility testing).
 */
'use strict';

const request = require('request');

const tenonEndpoint = 'https://tenon.io/api/';
const defaultOptions = {
  endpoint: tenonEndpoint
};

class TenonRequest {
  /**
   * Submit a tenon.io request.
   * Pass the result, as well as any error message, to a callback function.
   *
   * Params can be any valid tenon.io request parameters.
   * "key" and either "src" OR "uri" are required.
   * In addition, specify the "endpoint" option to use an API endpoint not hosted on tenon.io.
   *
   * @see https://tenon.io/documentation/understanding-request-parameters.php
   *
   * @param {object} params
   * @param {function} callback
   */
  submit(params, callback) {
    try {
      params = this.validate(params);
    } catch (e) {
      return callback(e, null);
    }

    request.post(params.endpoint, { form: params }, (error, response, body) => {
      if (error) {
        return callback(error, null);
      }

      let result = null;
      try {
        result = JSON.parse(body);
      } catch (e) {
        error = 'Failed to parse Tenon.io response body.';
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
  validate(options) {
    if (options === null || typeof options !== 'object') {
      throw 'Please provide a parameters object.';
    }

    if (!('key' in options) || (!('src' in options) && !('uri' in options))) {
      throw 'Some or all required parameters are missing: Please provide 1) key, and 2) src OR uri.';
    }

    if (!('endpoint' in options) || options.endpoint === null) {
      options.endpoint = tenonEndpoint;
    }

    return options;
  }
}

module.exports = TenonRequest;
