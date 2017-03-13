# www.wxkb.io
**Weather forecast in under 10kb** without any client side javascript.

# How can you contribute?
Contributions are appreciated more than you realize. 
Whether it’s coding, user interface design, graphic design, writing, or organizing, if you’re looking to help, there’s a task for you.
You're welcome to add your own task, or [check-out this list for inspiration](https://opensource.guide/how-to-contribute/#do-you-like-planning-events).

## Found a bug?
* File a bug report (try using issue and pull request templates)
Give context. Help others get quickly up to speed. If you’re running into an error, explain what you’re trying to do and how to reproduce it. 

## Have feedback or a suggestion?
1. Submit it here so we can prioritize it.
If you’re suggesting a new idea, explain why you think it’d be useful to the project (not just to you!).

## Need help setting up the environment?
1. Check out this in-depth tutorial. If you get stuck, let us know so we can help!

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
  * https://tenon.io/testNow.php?url=http://wxkb.io/10018
  * https://a-k-apart.com/faq#a11y
  * https://a11y-service.herokuapp.com/report/wxkb.io
  
#### Browser compatibility
  * http://browsershots.org/http://wxkb.io/
  
#### Performance
  * https://developers.google.com/speed/pagespeed/insights/?url=wxkb.io


### Misc
* [EJS template tutorial](http://www.embeddedjs.com/getting_started.html#create_template)
* [EJS github repo](https://github.com/mde/ejs)
* [Sublime text syntax package for `.ejs` files](https://packagecontrol.io/packages/EJS%202)
* Use [EditorConfig](http://editorconfig.org/) to maintain a consistent coding style between contributors. See [EditorConfig plugins](http://editorconfig.org/#download).
