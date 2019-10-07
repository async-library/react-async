# Upgrading

## Upgrade to v9

The rejection value for failed requests with `useFetch` was changed. Previously it was the Response object. Now it's an
Error object with `response` property. If you are using `useFetch` and are using the `error` value, expecting it to be
of type Response, you must now use `error.response` instead.

## Upgrade to v8

All standalone helper components were renamed to avoid import naming collision.

- `<Initial>` was renamed to `<IfInitial>`.
- `<Pending>` was renamed to `<IfPending>`.
- `<Fulfilled>` was renamed to `<IfFulfilled>`.
- `<Rejected>` was renamed to `<IfRejected`.
- `<Settled>` was renamed to `<IfSettled>`.

> A [codemod](https://github.com/async-library/react-async/tree/master/codemods) is available to automate the upgrade.

The return type for `run` was changed from `Promise` to `undefined`. You should now use the `promise` prop instead. This
is a manual upgrade. See [`promise`](state.md#promise) for details.

## Upgrade to v6

- `<Async.Pending>` was renamed to `<Async.Initial>`.
- Some of the other helpers were also renamed, but the old ones remain as alias.
- Don't forget to deal with any custom instances of `<Async>` when upgrading.

> A [codemod](https://github.com/async-library/react-async/tree/master/codemods) is available to automate the upgrade.

## Upgrade to v4

- `deferFn` now receives an `args` array as the first argument, instead of arguments to `run` being spread at the front
  of the arguments list. This enables better interop with TypeScript. You can use destructuring to keep using your
  existing variables.

- The shorthand version of `useAsync` now takes the `options` object as optional second argument. This used to be
  `initialValue`, but was undocumented and inflexible.
