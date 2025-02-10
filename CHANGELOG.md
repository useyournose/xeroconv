# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Calendar Versioning](https://calver.org/) in the format `YYYY-0M-0D`.

## 2025-02-10

### Fixed

- fixed csv/xls converter: shotview xlsx exports from german iOS devices use lower metricnames in the column headers.

### Changed

- The XLS converter is now promissing
- The XLS converter now uses the cleaned up first line of a sheet for the filename.

## 2025-02-09

### Fixed

- Fixed csv/xls converter, where the columns didn't match the header. Now the note field GRT should be populated properly with a timestamp.

### Changed

- The XLS converter now uses the sheetnames for filenaming.
- Filenames with less timestamps for csv/xls converters.

## 2025-02-08

### Fixed

- Fixed issue with shotview on iOS csv exports and german language settings, where "um" is used in the date.

### Changed

- updated DevDependencies
  - Bun 1.2.2
  - Happy Dom
  - ESLint

## 2025-02-02

### Changed

- updated dependencies:
  - [FITSDK 21.161.00](https://github.com/garmin/fit-javascript-sdk/releases/tag/21.161.0)
  - [Bulma 1.0.3](https://github.com/jgthms/bulma/releases/tag/1.0.3)
  - Papaparse 5.5.2

- CSV/XLS/XLSX conversion: On the average speed conversion, the number of decimals is now set to 3.

## 2024-12-25

### Changed

- added navigation via tab key

## 2024-12-21

### Changed

- updated dependencies, [FITSDK 21.158.00](https://forums.garmin.com/developer/fit-sdk/b/news-announcements/posts/fit-sdk-21-158-00-release)

## 2024-11-10

### Changed

- more metadata fields to enhance SEO

## 2024-10-19

### Changed

- converted the main functions to proper promises

### Added 

- added more tests

## 2024-10-12

### Changed

- moved from js to typescript
- moved from npm to bun

### Fixed

- Added i18n and proper handling of months for supported languages of the shotview app to handle [#23](https://github.com/useyournose/xeroconv/issues/23) .

## 2024-07-30

### Added

- added jest for testing
- split functions into own files
- added test files, assets, and mocks

### Changed

- moved from moment.js to day.js


## 2024-07-16

### Added

- added navbar
- added help modal
- added supported versions modal
- switched from fontawesome kit to fontawesome free

### Fixed

- shortened descriptions on upload buttons


## 2024-07-14

- enhanced ui for better separation between the tools (different box background)
- added parcel to pack the page
- created a github actions workflow to build and deploy the website


## 2024-07-12

### Added

- (Issue #5)[https://github.com/useyournose/xeroconv/issues/5]
  - added support for xls files from Shotview for Android
  - added support for xlsx files from Shotview for iOS

## 2024-07-10

### Fixed

- (Issue #4)[https://github.com/useyournose/xeroconv/issues/4]
  - handling cases when the bullet weight was missing
  - handling FPS and US date settings

## 2024-07-09

### Added

- multifile support: select one or more files at once
- enhanced message handling

### Changed

- moved the Labradarcsv format into own variable

### Fixed

- fixed fit2labradar validation

## 2024-07-08

### Added

- google site verification tag so people can find the page easier
- enhanced user experience

### Removed

- selector between metric and imperial, as fit shot_sessions is always metric.

## 2024-07-07

### Added

- `-xeroconv` suffix in created filenames
- more console logs
- fit2csv
    - metric - imperial switch for fit2csv converter
    - standard deviation and extreme spread added
- csv2csv
-   csv validation for csv2csv converter

## 2024-07-06

### Added

- shotview csv to labradar csv converter

### Fixed

- Fixed Footer, so it doesn't hide the second box

## 2024-07-05

### Added

- inital release
- fit2labradar converter
- github pages
- bulma css framework
- fontawsome fonts
