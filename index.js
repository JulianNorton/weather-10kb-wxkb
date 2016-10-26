const compression = require('compression');
const express = require('express');
const cookieParser = require('cookie-parser');
const moment = require('moment-timezone');
const minifyHTML = require('express-minify-html');
const weather10kb = require('./weather10kb');
const opbeat = require('opbeat');

const app = express();

app.locals.moment = moment;

app.use(compression());
app.use(minifyHTML({
  override: true,
  htmlMinifier: {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    minifyJS: true,
  },
}));
app.use(express.static(`${__dirname}/public`));
app.use(cookieParser());
app.use('/', weather10kb);

// Add the Opbeat middleware after your regular middleware
// injects opbeat, if error, registers in opbeat
app.use(opbeat.middleware.express());
// https://opbeat.com/docs/articles/get-started-with-express/#express-errors

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
