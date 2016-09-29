'use strict';
const req = require('request');
const moment = require('moment');
const queryString = require('query-string');

class ForecastIO {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.long = null;
        this.lat = null;
        this.t = null;
        this.query = {}
    }

    longitude(long) {
        !long ? Error('long value not provided.') : long;
        this.long = long;
        return this;
    }

    latitude(lat) {
        !lat ? Error('lat value not provided.') : lat;
        this.lat = lat;
        return this;
    }

    time(time) {
        if (!time) {
            return this;
        } else {
            this.t = moment(time).format('YYYY-MM-DDThh:mm:ss');
            return this;
        }
    }

    units(unit) {
        !unit ? null : this.query.units = unit;
        return this;
    }

    language(lang){
        !lang ? null : this.query.lang = lang;
        return this;
    }
    
    exclude(blocks){
        !blocks ? null : this.query.exclude = blocks;
        return this;
    }

    extendHourly(param){
        param ? this.query.extend = 'hourly' : null;
        return this ;      
    }

    generateReqUrl() {
        this.url = `https://api.forecast.io/forecast/${this.apiKey}/${this.lat},${this.long}`;
        this.t ? this.url += `,${this.t}` : this.url;
        this.query ? this.url += `?${queryString.stringify(this.query)}` : this.url;
    }

    get() {
        return new Promise((resolve, reject) => {
            this.generateReqUrl();
            req(this.url, (err, res, body) => {
                if (typeof res == 'undefined') {
                    reject('Unable to fetch forecast data.');
                } else if(res.statusCode !== 200 || err){
                    reject(`Script Error: ${err} \nAPI Response: ${res.statusCode} :: ${res.statusMessage}`)
                }
                resolve(body)
            })
        })
    }
}

module.exports = ForecastIO
