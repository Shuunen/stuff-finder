# Stuff Finder

[![GitHub license](https://img.shields.io/github/license/shuunen/stuff-finder.svg?color=informational)](https://github.com/Shuunen/stuff-finder/blob/master/LICENSE)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/Shuunen/stuff-finder?style=flat)](https://codeclimate.com/github/Shuunen/stuff-finder)
[![Scrutinizer Score](https://scrutinizer-ci.com/g/Shuunen/stuff-finder/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Shuunen/stuff-finder)
[![Website](https://img.shields.io/website/https/shuunen-goals.netlify.app.svg)](https://stuff-finder.netlify.app)

![banner](docs/banner.svg)

## Demo

[![logo](public/assets/favicon-16x16.png)](https://stuff-finder.netlify.app) [https://stuff-finder.netlify.app](https://stuff-finder.netlify.app)

## Todo

- [ ] nicer colorful identity ([something like this ?](https://www.iconfinder.com/icons/44859/cube_icon))
- [ ] BrowserMultiFormatReader is responsible for 245KB of the 320KB js build, maybe let user choose qr or [barcode](https://zxing-js.github.io/library/examples/barcode-camera/) to import only 2 specific readers instead of the fat "multi", and import on the fly
- [ ] remove old batch print barcode html/js/css
- [ ] add close confirmation on unsaved add item form modal
- [ ] detect user in/activity to refresh data
- [ ] show given/thrown items with a different color/display, also they're no more in box/room
- [ ] use hash instead of search params in url service
- [ ] use a visual switch/toggle instead of input type=checkbox name="ref-printed"

## Build sizes

- 0.1.1 : 4KB html + 9KB css + 320KB js
- 0.1.0 : 3KB html + 9KB css + 435KB js
- 0.2.0 : 8KB html + 20KB css + 305KB js
- 0.4.0 : 12KB html + 22KB css + 320KB js
- 0.5.0 : 12KB html + 22KB css + 330KB js

Check build stats in details by adding `--metafile=meta.json` to the esbuild command and use a tool like [Bundle Buddy](https://bundle-buddy.com/)

## Thanks

- [Add icon](https://www.iconfinder.com/icons/1814113/add_more_plus_icon) by Alexander Madyankin & Roman Shamin
- [Box icon](https://www.iconfinder.com/icons/2123914/app_box_essential_ui_icon) by Just Icon
- [Dependency-cruiser](https://github.com/sverweij/dependency-cruiser) : handy tool to validate and visualize dependencies
- [Esbuild](https://github.com/evanw/esbuild) : an extremely fast JavaScript bundler and minifier
- [Eslint](https://eslint.org) : super tool to find & fix problems
- [Eye icon](https://www.iconfinder.com/icons/5925640/eye_no_view_icon) by IconPai
- [Favicon.io](https://favicon.io/favicon-generator/?t=SF&ff=Istok+Web&fs=110&fc=#FFF&b=rounded&bc=#08F) : handy favicon generator
- [Github](https://github.com) : this great, free and evolving platform
- [Keyboard & mic icons](https://www.iconfinder.com/iconsets/bitsies) by Recep Kütük
- [Netlify](https://netlify.com) : awesome company that offers hosting for OSS
- [Npm-parallel](https://github.com/spion/npm-parallel) : to keep my npm scripts clean & readable
- [Repo-checker](https://github.com/Shuunen/repo-checker) : eslint cover /src code and this tool the rest ^^
- [RIOT Optimizer](https://riot-optimizer.com) : Radical Image Optimization Tool, the best software I found to compress images
- [Scan icon](https://www.iconfinder.com/icons/3702397/barcode_code_scan_scanner_icon) by Ghariza Mahavira
- [Servor](https://github.com/lukejacksonn/servor) : dependency free dev server for single page app development
- [Shields.io](https://shields.io) : for the nice badges on top of this readme
- [Shuutils](https://github.com/Shuunen/shuutils) : collection of pure JS utils
- [SvgOmg](https://jakearchibald.github.io/svgomg/) : great tool to reduce svg image size
- [TailwindCss](https://tailwindcss.com) : awesome lib to produce maintainable style
- [V8](https://github.com/demurgos/v8-coverage) : simple & effective cli for code coverage
- [Vite](https://github.com/vitejs/vite) : super fast frontend tooling
- [Vitest](https://github.com/vitest-dev/vitest) : super fast vite-native testing framework
