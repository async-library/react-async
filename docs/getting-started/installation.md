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

## Transpiling for legacy browsers

This project targets the latest ECMAScript version. Our packages on npm do not contain ES5 code for legacy browsers. If you need to target a browser which does not support the latest version of ECMAScript, you'll have to handle transpilation yourself. Usually this will automatically be handled by the framework you use (CRA, Next.js, Gatsby), but sometimes you may need to tweak your Webpack settings to transpile `react-async` with Babel.

To transpile `node_modules` with Babel you need to use a `babel.config.js`, for more information see [Babel's documentation](https://babeljs.io/docs/en/configuration#whats-your-use-case).

In your `webpack.config.js` make sure that the rule for `babel-loader`:

- doesn't exclude `node_modules` from matching via the `exclude` pattern;
- excludes `core-js` as it shouldn't be transpiled;
- is passed the `configFile` option pointing to the `babel.config.js` file.

```
{
  test: /\.(js|jsx)$/,
  exclude: /\/node_modules\/core-js\//,
  use: [{
    loader: 'babel-loader',
    options: {
      configFile: './babel.config.js',
      // Caching is recommended when transpiling node_modules to speed up consecutive builds
      cacheDirectory: true,
    }
  }]
}
```
