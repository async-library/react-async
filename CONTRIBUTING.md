# Contributing to React Async

Thanks for your interest in improving React Async! Contributions of any kind are welcome. Please refer to this guide before opening an issue or pull request.

This repo relies on Yarn workspaces, so you should [install](https://yarnpkg.com/en/docs/install) and use `yarn@1.3.2` or higher as the package manager for this project.

## Development guide

Please have the **_latest_** stable versions of the following on your machine

- node
- yarn

### Initial setup

To start working on React Async, clone the repo and bootstrap the project:

```sh
git clone https://github.com/async-library/react-async.git
cd react-async
yarn && yarn bootstrap && yarn test
```

Note that all work is done against the `next` branch, we only merge to `master` when doing a release.

### Working with Storybook

We use Storybook as a development environment, particularly for the DevTools. Spin it up using:

```sh
yarn start:storybook
```

This should open up Storybook in a browser at http://localhost:6006/
Run it side-by-side with `yarn test --watch` during development. See [Testing](#testing).

### Linting

Use `yarn lint` to verify your code style before committing. It's highly recommended to install the Prettier and ESLint plugins for your IDE. Travis CI will fail your build on lint errors. Configure VS Code with the following settings:

```plaintext
"eslint.autoFixOnSave": true,
"eslint.packageManager": "yarn",
"eslint.options": {
  "cache": true,
  "cacheLocation": ".cache/eslint",
  "extensions": [".js", ".jsx", ".mjs", ".json", ".ts", ".tsx"]
},
"eslint.validate": [
  "javascript",
  "javascriptreact",
  {"language": "typescript", "autoFix": true },
  {"language": "typescriptreact", "autoFix": true }
],
"eslint.alwaysShowStatus": true
```

This should enable auto-fix for all source files, and give linting warnings and errors within your editor.

### Testing

Use the following command to test all packages in watch mode. Refer to the [Jest CLI options](https://jestjs.io/docs/en/cli#options) for details.

```sh
yarn test:watch
```

In general, this is sufficient during development. The CI will apply a more rigorous set of tests.

### Working with the examples

In the `examples` folder, you will find sample React applications that use React Async in various ways with various other libraries. Please add a new example when introducing a major new feature. Make sure to add it to `now.json` so it is automatically deployed when merged to `master`.

To run sample examples on your local environments

```sh
yarn build:examples
yarn test:examples
yarn start:examples
```

### Resolving issues

Sometimes your dependencies might end up in a weird state, causing random issues, especially when working with the examples. In this case it often helps to run `yarn clean -y && yarn bootstrap`. This will delete `node_modules` from all packages/examples and do a clean install.
