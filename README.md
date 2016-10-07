# http://wxkb.io/
### Weather forecast in under 10kb.
Loads in less than 10kb (excluding favicons) without any client side javascript.

## Run wxkb.io locally
1. [Install node.js](https://nodejs.org/en/download/)
  * if you have [homebrew](http://brew.sh/), `brew install node`
1. clone repo via terminal: `git clone https://github.com/JulianNorton/weather-10kb.git`
1. cd into the weather-10kb folder: `cd weather-10kb`
1. install required packages: `npm install`
1. [Sign up for a dark sky API key](https://darksky.net/dev/register?wxkb)
1. Turn on local version: `DARK_SKY_API_KEY=<key> node index.js` †
  * Replace `<key>` with whatever your API key is
  * † Google api key will increase rate limit for the npm package `node-geocoder`
    * † **may require google api** key, see: https://github.com/JulianNorton/weather-10kb/issues/62
    * `DARK_SKY_API_KEY=<key> GOOGLE_API_KEY=<key> node index.js` to run it locally with the google key
  * Ignore opbeat "isn't correctly configured", that's used only for wxkb.io production logging
1. go to http://localhost:5000
  * It should show an error when loaded "Error: Unable to determine location based on IP address.", that's normal!
1. [Submit any bugs, questions, or ideas you have!](https://github.com/JulianNorton/weather-10kb/issues)


### Modify & Compile CSS
  * `styles-compiler.scss` compiles into `main.css` using [node-sass](https://npmjs.org/package/node-sass)
  * `npm run watch-css` Automatically compiles css whenever there's a change to the `.scss`
  * `npm run build-css` If you want to compile css once 


### Please fork, modify, and use this project!
Open source, General Public License v2.

### Misc
* [Sublime text syntax package for `.ejs` files](https://packagecontrol.io/packages/EJS%202)
