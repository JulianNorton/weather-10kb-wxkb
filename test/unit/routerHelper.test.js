'use strict';

const chai = require('chai');
const expect = chai.expect;
const { cookieName } = require('../../src/config.json');
const { getPrevCookie } = require('../../src/routerHelper');


describe('Router helper', () => {

  it('should return undefined for a non-existent cookie', () => {
    const req = { cookies: {} };
    const prevCookie = getPrevCookie(req, cookieName);

    expect(prevCookie).to.equal(undefined);
  });

});
