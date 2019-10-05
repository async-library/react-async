# Getting started

You can install `react-async` from npm:

```text
npm install --save react-async
```

Or if you're using Yarn:

```text
yarn add react-async
```

> This package requires `react` as a peer dependency. Please make sure to install that as well. If you want to use the `useAsync` hook, you'll need `react@16.8.0` or later.

## Upgrading

### Upgrade to v8

All standalone helper components were renamed to avoid import naming collision.

* `<Initial>` was renamed to `<IfInitial>`.
* `<Pending>` was renamed to `<IfPending>`.
* `<Fulfilled>` was renamed to `<IfFulfilled>`.
* `<Rejected>` was renamed to `<IfRejected`.
* `<Settled>` was renamed to `<IfSettled>`.

> A [codemod](https://github.com/async-library/react-async/tree/master/codemods) is available to automate the upgrade.

The return type for `run` was changed from `Promise` to `undefined`. You should now use the `promise` prop instead. This is a manual upgrade. See [`promise`](installation.md#promise-1) for details.

### Upgrade to v6

* `<Async.Pending>` was renamed to `<Async.Initial>`.
* Some of the other helpers were also renamed, but the old ones remain as alias.
* Don't forget to deal with any custom instances of `<Async>` when upgrading.

> A [codemod](https://github.com/async-library/react-async/tree/master/codemods) is available to automate the upgrade.

### Upgrade to v4

* `deferFn` now receives an `args` array as the first argument, instead of arguments to `run` being spread at the front

  of the arguments list. This enables better interop with TypeScript. You can use destructuring to keep using your

  existing variables.

* The shorthand version of `useAsync` now takes the `options` object as optional second argument. This used to be

  `initialValue`, but was undocumented and inflexible.

