# Stuff Finder

[![GitHub license](https://img.shields.io/github/license/shuunen/stuff-finder.svg?color=informational)](https://github.com/Shuunen/stuff-finder/blob/master/LICENSE)

[![Build Status](https://travis-ci.org/Shuunen/stuff-finder.svg?branch=master)](https://travis-ci.org/Shuunen/stuff-finder)
[![David](https://img.shields.io/david/shuunen/stuff-finder.svg)](https://david-dm.org/shuunen/stuff-finder)
[![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/github/Shuunen/stuff-finder.svg)](https://lgtm.com/projects/g/Shuunen/stuff-finder)
[![Scrutinizer Score](https://scrutinizer-ci.com/g/Shuunen/stuff-finder/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Shuunen/stuff-finder)

> Sorting things is pointless if you can't find them afterwards :D

## Todo

- [ ] nicer colorful identity ([something like this ?](https://www.iconfinder.com/icons/44859/cube_icon))
- [ ] print barcode modal need to display all non-printed items in a table like :

| name             | reference | box | drawer | print ? |
| ---------------- | --------- | --- | ------ | ------- |
| good-1           | xxx       | D   | 4      | [x]     |
| bad-1            |           | C   | 2      | [ ]     |
| bad-2            | yyy       |     | 2      | [ ]     |
| good-2           | aaa       | N/A |        | [x]     |
| good-66 but > 65 | zzz       | V   | 2      | [ ]     |

This table is important because it allows to review before print :

- good-1 meet all criteria and less than 65 barcode selected -> pre-check for print
- bad-1 reference empty -> **cannot** be printed (check disabled without reference)
- bad-2 has reference but box empty -> **cannot** be printed (check disabled without box)
- good-2 has reference and box is N/A -> pre-check for print
- good-66 meet all criteria but max barcodes selected, need to un-check others to check this one

These data should be editable to fix issues, an `update` button could appear once a field has been `changed` to update remote data.

Once user has made selection & clicked preview, then preview screen appears with the print button.

## Thanks

- [Box icon](https://www.iconfinder.com/icons/2123914/app_box_essential_ui_icon) by Just Icon
- [Github](https://github.com) : this great, free and evolving platform
- [Netlify](https://netlify.com) : awesome company that offers hosting for OSS
- [Npm-run-all](https://github.com/mysticatea/npm-run-all) : to keep my npm scripts clean & readable
- [Parcel Js](https://parceljs.org) : fast & easy to use bundler
- [Shields.io](https://shields.io) : for the nice badges on top of this readme
- [Travis-ci.org](https://travis-ci.org) : for providing free continuous deployments
