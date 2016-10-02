# http://wxkb.io/
### Weather forecast in under 10kb.
Loads in less than 10kb (excluding favicons) without any client side javascript.

## Run wxkb.io locally
1. [Install node.js](https://nodejs.org/en/download/)
  * if you have [homebrew](http://brew.sh/), `brew install node`
1. clone repo, `git clone https://github.com/JulianNorton/weather-10kb.git`
1. `npm install`
  * this installs other packages that make wxkb.io work.
1. [Sign up for a dark sky API key](https://darksky.net/dev/register)
1. `DARK_SKY_API_KEY=<key> node index.js`
  * replace `<key>` with whatever your API key is.
  * Production branch uses `FORECAST_IO_API_KEY` instead of `DARK_SKY_API_KEY`
  * Google api key isn't required, but will increase rate limit for the npm package `node-geocoder`
  * `DARK_SKY_API_KEY=<key> GOOGLE_API_KEY=<key> node index.js` to run it locally with the google key.
  * Ignore opbeat "isn't correctly configured", that's used only for wxkb.io production logging
1. go to http://localhost:5000
  * Note that it should show an error on when loaded and show "Error: Unable to determine location based on IP address.".
1. [Submit any bugs, questions, or ideas you have!](https://github.com/JulianNorton/weather-10kb/issues)


### Compile CSS
  * Automatically compile: `npm run watch-css`
  * If you just want to run it once: `npm run build-css`



#### Please fork, modify, and use this project! If you want to contribute, [open a pull request!](https://github.com/JulianNorton/weather-10kb/pulls)


[GNU General Public License GPL-2.0](https://opensource.org/licenses/GPL-2.0)

> The GNU GPL is the most widely used free software license. When distributing derived works, the source code of the work must be made available under the same license.
