# Convert Garmin Xero Files

> [!CAUTION]
> Work in progress

Convert files from the Garmin Xero C1 Pro Chronograph to something you can import into the [GRT](https://www.grtools.de/).

You can use the tools on https://useyournose.github.io/xeroconv/.

## Compatibility

As Garmin is a big and funny company and my code is fragile, here are the tested versionsof the different fileformats the Xero and Shotview provides.

| filetype | version |
| :---: | :---: |
| `*.fit` | ![Endpoint Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fuseyournose%2Fxeroconv%2Fmain%2Fversion_xero.json) |
| `*.csv` | ![Endpoint Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fuseyournose%2Fxeroconv%2Fmain%2Fversion_shotview_a.json)|
| `*.csv` | ![Endpoint Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fuseyournose%2Fxeroconv%2Fmain%2Fversion_shotview_i.json)| |
| `*.xls` | ![Endpoint Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fuseyournose%2Fxeroconv%2Fmain%2Fversion_shotview_a.json)| |
| `*.xlsx` | ![Endpoint Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fuseyournose%2Fxeroconv%2Fmain%2Fversion_shotview_i.json)| |


## techstack

https://github.com/  
https://pages.github.com/  
https://docs.github.com/en/actions  
https://parceljs.org/

## third party tools

[3rd Party Attributions](third-party-attributions.txt)

| tool | latest release | version in use |
| --- | --- | --- |
| https://www.papaparse.com/ | ![GitHub Release](https://img.shields.io/github/v/release/mholt/papaparse?sort=date) | ![GitHub package.json prod dependency version](https://img.shields.io/github/package-json/dependency-version/useyournose/xeroconv/papaparse) |
| https://docs.sheetjs.com/docs/  | https://cdn.sheetjs.com/ | ![GitHub package.json prod dependency version](https://img.shields.io/github/package-json/dependency-version/useyournose/xeroconv/xlsx) |
| https://github.com/garmin/fit-javascript-sdk?tab=License-1-ov-file  | ![GitHub Release](https://img.shields.io/github/v/release/garmin/fit-javascript-sdk?sort=date) | ![GitHub package.json prod dependency version](https://img.shields.io/github/package-json/dependency-version/useyournose/xeroconv/%40garmin%2Ffitsdk) |
| https://bulma.io/documentation  | ![GitHub Release](https://img.shields.io/github/v/release/jgthms/bulma?sort=date) | ![GitHub package.json prod dependency version](https://img.shields.io/github/package-json/dependency-version/useyournose/xeroconv/bulma) |
| https://fontawesome.com/ |  |  |

## building and updating

1. install node.js https://nodejs.org/en/download/package-manager/current
1. do the `npm install`
  1. install parcel `npm -g --instal` https://parceljs.org/getting-started/webapp/
  1. install garmin fitsdk `npm install @garmin/fitsdk`
  1. install bulma `npm install bulma`
  1. install papaparse `npm install papaparse`
  1. install fontawesome free `npm install --save @fortawesome/fontawesome-free`
  1. install sheetjs `npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`

### bulma

https://bulma.io/documentation/start/installation/ 

### papaparse

[Install](https://github.com/mholt/PapaParse?tab=readme-ov-file#install) references [unpkg](https://unpkg.com/papaparse@latest/papaparse.min.js)

### sheetjs

[cdn.sheetsjs.com](https://cdn.sheetjs.com/)

### fitsdk

download in the release section [garmin/fitsdk](https://github.com/garmin/fit-javascript-sdk)

