var compression = require('compression');
var express = require('express');
var cookieParser = require('cookie-parser');
var moment = require('moment-timezone');
var minifyHTML = require('express-minify-html');
var weather10kb = require('./weather10kb');
var opbeat = require('opbeat')

var app = express();

// Read the Certbot response from an environment variable; we'll set this later:
const letsEncryptReponse = process.env.CERTBOT_RESPONSE;

// Return the Let's Encrypt certbot response:
app.get('/.well-known/acme-challenge/:content', function(req, res) {
  res.send(letsEncryptReponse);
});

app.locals.moment = moment;

app.use(compression());
app.use(minifyHTML({
  override:      true,
  htmlMinifier: {
    removeComments:            true,
    collapseWhitespace:        true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes:     true,
    removeEmptyAttributes:     true,
    minifyJS:                  true
  }
}));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use('/', weather10kb);
// Add the Opbeat middleware after your regular middleware
app.use(opbeat.middleware.express()) // injects opbeat, if error, registers in opbeat
// https://opbeat.com/docs/articles/get-started-with-express/#express-errors

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
