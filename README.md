# http://wxkb.io/
Weather forecast in under 10kb.



## Run app with Node
1. clone repo
2. `npm install`
3. `FORECAST_IO_API_KEY=<key> GOOGLE_API_KEY=<key> node index.js`
  * google api key isn't required, but will increase rate limit for the npm package `node-geocoder`.


### Compile CSS
* Automatically compile: `npm run watch-css`
* If you just want to run it once: `npm run build-css`
