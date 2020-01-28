# Installation

You can install `react-async` from npm:

```text
npm install --save react-async
```

Or if you're using Yarn:

```text
yarn add react-async
```

> This package requires `react` as a peer dependency. Please make sure to install that as well. If you want to use the
> `useAsync` hook, you'll need `react@16.8.0` or later.

## Targeting older browsers

If you are targeting older browsers you need to transpile `react-async` with babel.

To transpile `node_modules` with babel you need to use a `babel.config.js`, for more information see [babel's documentation](https://babeljs.io/docs/en/configuration#whats-your-use-case).

In your `webpack.config.js` make sure that the rule for `babel-loader`:
  * doesn't exclude `node_modules` from matching via the `exclude` pattern;
  * excludes `core-js` as it shouldn't be transpiled;
  * is passed the `configFile` option pointing to the `babel.config.js` file.

```
{
  test: /\.(js|jsx)$/,
  exclude: /\/node_modules\/core-js\//,
  use: [{
    loader: 'babel-loader',
    options: {
      configFile: './babel.config.js',
      // This is recommended to enable when transpiling node_modules to improve build times for consecutive builds.
      cacheDirectory: true,
    }
  }]
}
```
