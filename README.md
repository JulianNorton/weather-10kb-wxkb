# http://wxkb.io/
### Weather forecast in under 10kb.
* wxkb will *always* be less than 10kb excluding favicons.
* wkxb will always be functional without any client side javascript.


## Run app with Node
1. clone repo
2. `npm install`
3. `DARK_SKY_API_KEY=<key> GOOGLE_API_KEY=<key> node index.js`
  * Production branch uses `FORECAST_IO_API_KEY` instead of `DARK_SKY_API_KEY`
  * Google api key isn't required, but will increase rate limit for the npm package `node-geocoder`.
  * Ignore opbeat "isn't correctly configured", that's used for wxkb.io logging.


### Compile CSS
* Automatically compile: `npm run watch-css`
* If you just want to run it once: `npm run build-css`



#### Please fork, modify, and use this project! Just make sure the pull-requests are to the _development_ branch
[GNU General Public License GPL-2.0](https://opensource.org/licenses/GPL-2.0)

> The GNU GPL is the most widely used free software license. When distributing derived works, the source code of the work must be made available under the same license.
