'use strict';

const { defaultUnits } = require('./config.json');


function getPrevCookie(req, name) {
  const cookie = req.cookies[name];
  if (cookie && typeof cookie === 'object' && 'units' in cookie && cookie.units in defaultUnits) {
    return cookie;
  }
}


module.exports = {
  getPrevCookie: getPrevCookie
};