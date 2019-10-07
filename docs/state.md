# State properties

These are returned in an object by `useAsync()` or provided by `<Async>` as render props to the `children` function:

- [`data`](#data) Last resolved promise value, maintained when new error arrives.
- [`error`](#error) Rejected promise reason, cleared when new data arrives.
- [`value`](#value) The value of `data` or `error`, whichever was last updated.
- [`initialValue`](#initialvalue) The data or error that was provided through the `initialValue` prop.
- [`startedAt`](#startedat) When the current/last promise was started.
- [`finishedAt`](#finishedat) When the last promise was fulfilled or rejected.
- [`status`](#status) One of: `initial`, `pending`, `fulfilled`, `rejected`.
- [`isInitial`](#isinitial) true when no promise has ever started, or one started but was cancelled.
- [`isPending`](#ispending) true when a promise is currently awaiting settlement. Alias: `isLoading`
- [`isFulfilled`](#isfulfilled) true when the last promise was fulfilled. Alias: `isResolved`
- [`isRejected`](#isrejected) true when the last promise was rejected.
- [`isSettled`](#issettled) true when the last promise was fulfilled or rejected \(not initial or pending\).
- [`counter`](#counter) The number of times a promise was started.
- [`promise`](#promise) A reference to the internal wrapper promise, which can be chained on.
- [`run`](#run) Invokes the `deferFn`.
- [`reload`](#reload) Re-runs the promise when invoked, using any previous arguments.
- [`cancel`](#cancel) Cancel any pending promise.
- [`setData`](#setdata) Sets `data` to the passed value, unsets `error` and cancels any pending promise.
- [`setError`](#seterror) Sets `error` to the passed value and cancels any pending promise.

## `data`

> `any`

Last resolved promise value, maintained when new error arrives.

## `error`

> `Error`

Rejected promise reason, cleared when new data arrives.

## `value`

> `any | Error`

The data or error that was last provided \(either through `initialValue` or by settling a promise\).

## `initialValue`

> `any | Error`

The data or error that was originally provided through the `initialValue` prop.

## `startedAt`

> `Date`

Tracks when the current/last promise was started.

## `finishedAt`

> `Date`

Tracks when the last promise was resolved or rejected.

## `status`

> `string`

One of: `initial`, `pending`, `fulfilled`, `rejected`. These are available for import as `statusTypes`.

## `isInitial`

> `boolean`

`true` while no promise has started yet, or one was started but cancelled.

## `isPending`

> `boolean`

`true` while a promise is pending \(loading\), `false` otherwise.

Alias: `isLoading`

## `isFulfilled`

> `boolean`

`true` when the last promise was fulfilled \(resolved to a value\).

Alias: `isResolved`

## `isRejected`

> `boolean`

`true` when the last promise was rejected.

## `isSettled`

> `boolean`

`true` when the last promise was either fulfilled or rejected \(i.e. not initial or pending\)

## `counter`

> `number`

The number of times a promise was started.

## `promise`

> `Promise`

A reference to the internal wrapper promise created when starting a new promise \(either automatically or by invoking `run` / `reload`\). It fulfills or rejects along with the provided `promise` / `promiseFn` / `deferFn`. Useful as a chainable alternative to the `onResolve` / `onReject` callbacks.

Warning! If you chain on `promise`, you MUST provide a rejection handler \(e.g. `.catch(...)`\). Otherwise React will throw an exception and crash if the promise rejects.

## `run`

> `function(...args: any[]): void`

Runs the `deferFn`, passing any arguments provided as an array.

When used with `useFetch`, `run` has several overloaded signatures:

> `function(resource: String | Resource, init: Object | (init: Object) => Object): void`
>
> `function(init: Object | (init: Object) => Object): void`
>
> `function(event: SyntheticEvent | Event): void`
>
> `function(): void`

This way you can run the `fetch` request using the provided `resource` and `init`. `resource` can be omitted. If `init` is an object it will be spread over the default `init` \(`useFetch`'s 2nd argument\). If it's a function it will be invoked with the default `init` and should return a new `init` object. This way you can either extend or override the value of `init`, for example to set request headers.

## `reload`

> `function(): void`

Re-runs the promise when invoked, using the previous arguments.

## `cancel`

> `function(): void`

Cancels the currently pending promise by ignoring its result and calls `abort()` on the AbortController.

## `setData`

> `function(data: any, callback?: () => void): any`

Function that sets `data` to the passed value, unsets `error` and cancels any pending promise. Takes an optional callback which is invoked after the state update is completed. Returns the data to enable chaining.

## `setError`

> `function(error: Error, callback?: () => void): Error`

Function that sets `error` to the passed value and cancels any pending promise. Takes an optional callback which is invoked after the state update is completed. Returns the error to enable chaining.
