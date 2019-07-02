/* eslint-disable no-console */
console.log("Loaded babel.config.js")

module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: ["@babel/plugin-proposal-object-rest-spread"],

  env: {
    test: {
      presets: ["@babel/preset-env", "@babel/preset-react"],
      plugins: ["@babel/plugin-transform-runtime"],
    },
  },
}
