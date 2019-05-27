module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: ["@babel/plugin-proposal-object-rest-spread"],
  include: ["../../packages"],
  env: {
    test: {
      presets: ["@babel/preset-env"],
      plugins: ["@babel/plugin-transform-runtime"],
    },
  },
}
