# http://wxkb.io/
**Weather forecast in under 10kb** (excluding favicons) without any client side javascript.

# Run wxkb.io locally
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


## Modify & Compile CSS
  * `styles-compiler.scss` compiles into `main.css` using [node-sass](https://npmjs.org/package/node-sass)
  * `npm run watch-css` Automatically compiles css whenever there's a change to the `.scss`
  * `npm run build-css` If you want to compile css once 
  * `npm rebuild node-sass` if you're switching branches a lot this can fix node-sass crashes.


## Please fork, modify, and use this project!
Open source, General Public License v2. Basically do whatever you want with it. Pull requests must keep these tenants in mind:

#### Accessibility (a11y)
  * https://a-k-apart.com/faq#a11y
  * https://a11y-service.herokuapp.com/report/wxkb.io
  
#### Browser compatibility
  * http://browsershots.org/http://wxkb.io/
  
#### Performance
  * https://developers.google.com/speed/pagespeed/insights/?url=wxkb.io


### Misc
* [EJS template tutorial](http://www.embeddedjs.com/getting_started.html#create_template)
* [Sublime text syntax package for `.ejs` files](https://packagecontrol.io/packages/EJS%202)
* Use [EditorConfig](http://editorconfig.org/) to maintain a consistent coding style between contributors. See [EditorConfig plugins](http://editorconfig.org/#download).
