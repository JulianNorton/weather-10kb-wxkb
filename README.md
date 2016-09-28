# http://wxkb.io/
Weather forecast in under 10kb.



## Run app with Node
1. clone repo
2. `npm install`
3. `DARK_SKY_API_KEY=<key> GOOGLE_API_KEY=<key> node index.js`
  * Requires a dark sky api key from [darksky.net/dev](https://darksky.net/dev/register?wxkb)
  * google api key isn't required, but will increase rate limit for the npm package `node-geocoder`.


### Compile CSS
* Automatically compile: `npm run watch-css`
* If you just want to run it once: `npm run build-css`



### Please fork, modify, and use this project!
**Submit pull requests to the [development branch](https://github.com/JulianNorton/weather-10kb/tree/development)**


[GNU General Public License GPL-2.0](https://opensource.org/licenses/GPL-2.0)

> The GNU GPL is the most widely used free software license. When distributing derived works, the source code of the work must be made available under the same license.
