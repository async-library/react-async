const withTM = require("@weco/next-plugin-transpile-modules")

module.exports = withTM({
  transpileModules: [
    "react-async",
    "react-async-devtools"
  ]
})
