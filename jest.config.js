/* eslint-disable no-console */
for (let pkg of [
  "@testing-library/jest-dom",
  "@testing-library/react",
  "jest",
  "react",
  "react-dom",
]) {
  console.log(
    `Using \u001b[36;1m${pkg}@${require(`./node_modules/${pkg}/package.json`).version}\u001b[0m`
  )
}

module.exports = {
  rootDir: "./",
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  verbose: true,
  bail: true,
  transform: { "^.+\\.js$": "babel-jest" },
  projects: ["<rootDir>/packages/*"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/pkg/"],
}
