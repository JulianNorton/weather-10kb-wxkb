'use strict';

const compression = require('compression');
const express = require('express');
const cookieParser = require('cookie-parser');
const moment = require('moment-timezone');
const minifyHTML = require('express-minify-html');
const router = require('./router');
const helmet = require('helmet');


const app = new express();

// Read the Certbot response from an environment variable; we'll set this later
const letsEncryptReponse = process.env.CERTBOT_RESPONSE;

// Return the Let's Encrypt certbot response:
app.get('/.well-known/acme-challenge/:content', (req, res) => {
  res.send(letsEncryptReponse);
});

app.locals.moment = moment;

app.use(compression());
app.use(helmet({
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
      // unsafe-inline because there is a <style> in <head>
    }
  }
}));
app.use(minifyHTML({
  override: true,
  htmlMinifier: {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    minifyJS: true
  }
}));
app.use(express.static(__dirname + '/../public'));
app.use(cookieParser());
app.use('/', router);

app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');


module.exports = app;
