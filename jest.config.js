/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
const { createDefaultPreset } = require('ts-jest')

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // [...]
  ...createDefaultPreset(),
}

/** @type {import('jest').Config} */
const config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ["**/src/index.ts","**/src/js/*.ts"],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
   coveragePathIgnorePatterns: [
     "\\\\node_modules\\\\"
   ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // A list of reporter names that Jest uses when writing coverage reports
   coverageReporters: [
  //   "json",
  //   "text",
     "lcov",
     "clover"
   ],

  // A path to a custom dependency extractor
  // dependencyExtractor: undefined,

  // Make calling deprecated APIs throw helpful error messages
  // errorOnDeprecated: false,

  // A set of global variables that need to be available in all test environments
  // globals: {},

  // An array of directory names to be searched recursively up from the requiring module's location
   moduleDirectories: [
     "node_modules",
     "src/js/"
  ],

  // An array of file extensions your modules use
   moduleFileExtensions: [
    "js",
    // "mjs",
  //   "cjs",
  //   "jsx",
     "ts",
  //   "tsx",
  //   "json",
  //   "node"
  ],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "^./download.ts$": "<rootDir>/src/js/__mocks__/download.ts",
    "^./messages.ts$": "<rootDir>/src/js/__mocks__/messages.ts",
  },

  // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
  // modulePathIgnorePatterns: [],

  // The glob patterns Jest uses to detect test files
  testMatch: [
     //"src/_tests/.*\.test\.js",
     "**/?(*.)+(spec|test).(m)[tj]s?(x)",
     "**/?(*.)+(spec|test).[tj]s?(x)"
   ],

  // A map from regular expressions to paths to transformers
  //transform: {
//        "^.+\\\\.[t|j]s?$": "babel-jest"
  //},

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
transformIgnorePatterns: [
  ".+/node_modules/@garmin/fitsdk"
],
//    ".+/src/js/"
     //"\\\\node_modules\\\\",
  //   "\\.pnp\\.[^\\\\]+$"
//  ],

transform: {},
//  "^.+\\.js(x)?$": "babel-jest",
//  "^.+\\.mjs$": "babel-jest",
//},
testPathIgnorePatterns: [".+/node_modules/"],

  // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
  // unmockedModulePathPatterns: undefined,

  // Indicates whether each individual test should be reported during the run
  // verbose: undefined,

  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  // watchPathIgnorePatterns: [],

  // Whether to use watchman for file crawling
  // watchman: true,
  preset: "ts-jest"
};

module.exports = config;
