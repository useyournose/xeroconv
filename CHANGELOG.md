# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Calendar Versioning](https://calver.org/) in the format `YYYY-0M-0D`.

## 2024-07-30

### Added

- added jest for testing
- split functions into own files
- added test files, assets, and mocks


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

- `-xeroconf` suffix in created filenames
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
