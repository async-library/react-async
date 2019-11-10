module.exports = {
  presets: ["@babel/preset-react"],
  plugins: ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-proposal-class-properties"],

  env: {
    test: {
      presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
      plugins: ["@babel/plugin-transform-runtime", "@babel/plugin-proposal-class-properties"],
    },
  },
}
