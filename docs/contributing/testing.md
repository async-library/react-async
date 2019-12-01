# Testing

Use the following command to test all packages in watch mode. Refer to the [Jest CLI options][jest options] for details.

[jest options]: https://jestjs.io/docs/en/cli#options

```sh
yarn test:watch
```

In general, this is sufficient during development. CircleCI and Travis will eventually apply a more rigorous set of
tests against your pull request, including the ones below.

## Testing the examples

Because React Async is only a piece in a bigger puzzle, testing for integration with other libraries is very important.
You can run the tests for all examples against your local changes with the following command:

```sh
yarn test:examples
```

If you want to add integration tests for compatibility with another library, please add an example for it.

## Testing for compatibility

```sh
yarn test:compat
```

This runs all tests using various versions of `react` and `react-dom`, to check for compatibility with older/newer
versions of React. This is what CircleCI and Travis run.

## Linting

Use `yarn lint` to verify your code style before committing. It's highly recommended to install the Prettier and ESLint plugins for your IDE. CircleCI and Travis will fail your build on lint errors.
