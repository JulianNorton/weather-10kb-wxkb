# http://wxkb.io/
### Weather forecast in under 10kb.
* wxkb will load in less than 10kb (excluding favicons).
* wkxb is functional without any client side javascript.


## Run app with Node
1. clone repo
2. `npm install`
3. `FORECAST_IO_API_KEY=<key> GOOGLE_API_KEY=<key> node index.js`
  * Development branch uses **DARK_SKY_API_KEY** instead of FORECAST_IO_API_KEY
  * google api key isn't required, but will increase rate limit for the npm package `node-geocoder`.


### Compile CSS
* Automatically compile: `npm run watch-css`
* If you just want to run it once: `npm run build-css`



#### Please fork, modify, and use this project! Just make sure the pull-requests are to the _development_ branch
[GNU General Public License GPL-2.0](https://opensource.org/licenses/GPL-2.0)

> The GNU GPL is the most widely used free software license. When distributing derived works, the source code of the work must be made available under the same license.
