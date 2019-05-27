module.exports = {
  verbose: true,
  bail: true,
  transform: { "^.+\\.js$": "babel-jest" },
  projects: ["<rootDir>/packages/*"],
}
