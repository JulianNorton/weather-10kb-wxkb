'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

const app = require('../../src/app');

describe('Weather10kb app', function () {

  // @TODO: Optimize the output to make this test pass.
  it('should deliver a body with a maximum size of 10kb', function (done) {
    chai.request(app)
      .get('/')
      .end(function (err, res) {
        expect(res.text).to.not.have.length.above(10000);
        done();
      });
  });

});
