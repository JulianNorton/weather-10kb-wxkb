var compression = require('compression');
var express = require('express');
var moment = require('moment-timezone');
var minifyHTML = require('express-minify-html');
var weather10kb = require('./weather10kb');

var app = express();

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
app.use('/', weather10kb);

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
