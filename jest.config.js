/* eslint-disable no-console */
console.log("Loaded jest.config.js")

module.exports = {
  rootDir: "./",
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  verbose: true,
  bail: true,
  transform: { "^.+\\.js$": "babel-jest" },
  projects: ["<rootDir>/packages/*"],
}
