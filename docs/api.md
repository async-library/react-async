# API

## Options

These can be passed in an object to `useAsync()`, or as props to `<Async>` and custom instances.

- [`promise`](#promise) An already started Promise instance.
- [`promiseFn`](#promisefn) Function that returns a Promise, automatically invoked.
- [`deferFn`](#deferfn) Function that returns a Promise, manually invoked with `run`.
- [`watch`](#watch) Watch a value and automatically reload when it changes.
- [`watchFn`](#watchfn) Watch this function and automatically reload when it returns truthy.
- [`initialValue`](#initialvalue) Provide initial data or error for server-side rendering.
- [`onResolve`](#onresolve) Callback invoked when Promise resolves.
- [`onReject`](#onreject) Callback invoked when Promise rejects.
- [`onCancel`](#oncancel) Callback invoked when a Promise is cancelled.
- [`reducer`](#reducer) State reducer to control internal state updates.
- [`dispatcher`](#dispatcher) Action dispatcher to control internal action dispatching.
- [`debugLabel`](#debuglabel) Unique label used in DevTools.
- [`suspense`](#suspense) Enable **experimental** Suspense integration.

`useFetch` additionally takes these options:

- [`defer`](#defer) Force the use of `deferFn` or `promiseFn`.
- [`json`](#json) Enable JSON parsing of the response.

### `promise`

> `Promise`

A Promise instance which has already started. It will simply add the necessary resolve/reject callbacks and set `startedAt` to the time `promise` was first provided. Changing the value of `promise` will cancel any pending promise and listen to the new one. If `promise` is initially undefined, the React Async state will be `pending`.

> Note that `reload` will not do anything when using `promise`. Use `promiseFn` instead.

### `promiseFn`

> `function(props: Object, controller: AbortController): Promise`

A function that returns a promise. It is automatically invoked in `componentDidMount` and `componentDidUpdate`. The function receives all component props \(or options\) and an AbortController instance as arguments.

> Be aware that updating `promiseFn` will trigger it to cancel any pending promise and load the new promise. Passing an arrow function will cause it to change and reload on every render of the parent component. You can avoid this by defining the `promiseFn` value **outside** of the render method. If you need to pass variables to the `promiseFn`, pass them as additional props to `<Async>`, as `promiseFn` will be invoked with these props. Alternatively you can use [memoization](https://github.com/alexreardon/memoize-one) to avoid unnecessary updates.

### `deferFn`

> `function(args: any[], props: Object, controller: AbortController): Promise`

A function that returns a promise. This is invoked only by manually calling `run(...args)`. Receives the same arguments as `promiseFn`, as well as any arguments to `run` which are passed through as an array. The `deferFn` is commonly used to send data to the server following a user action, such as submitting a form. You can use this in conjunction with `promiseFn` to fill the form with existing data, then updating it on submit with `deferFn`.

> Be aware that when using both `promiseFn` and `deferFn`, the shape of their fulfilled value should match, because they both update the same `data`.

### `watch`

> `any`

Watches this property through `componentDidUpdate` and re-runs the `promiseFn` when the value changes, using a simple reference check \(`oldValue !== newValue`\). If you need a more complex update check, use `watchFn` instead.

### `watchFn`

> `function(props: Object, prevProps: Object): boolean | any`

Re-runs the `promiseFn` when this callback returns truthy \(called on every update\). Any default props specified by `createInstance` are available too.

### `initialValue`

> `any | Error`

Initial state for `data` or `error` \(if instance of Error\); useful for server-side rendering. When an `initialValue` is provided, the `promiseFn` will not be invoked on first render. Instead, `status` will be immediately set to `fulfilled` or `rejected` and your components will render accordingly. If you want to trigger the `promiseFn` regardless, you can call `reload()` or use the `watch` or `watchFn` option.

> Note that `onResolve` or `onReject` is not invoked in this case and no `promise` prop will be created.

### `onResolve`

> `function(data: any): void`

Callback function invoked when a promise resolves, receives data as argument.

### `onReject`

> `function(reason: Error): void`

Callback function invoked when a promise rejects, receives rejection reason \(error\) as argument.

### `onCancel`

> `function(): void`

Callback function invoked when a promise is cancelled, either manually using `cancel()` or automatically due to props changes or unmounting.

### `reducer`

> `function(state: any, action: Object, internalReducer: function(state: any, action: Object))`

State reducer to take full control over state updates by wrapping the [internal reducer](https://github.com/async-library/react-async/blob/master/src/reducer.js). It receives the current state, the dispatched action and the internal reducer. You probably want to invoke the internal reducer at some point.

> This is a power feature which loosely follows the [state reducer pattern](https://kentcdodds.com/blog/the-state-reducer-pattern). It allows you to control state changes by intercepting actions before they are handled, or by overriding or enhancing the reducer itself.

### `dispatcher`

> `function(action: Object, internalDispatch: function(action: Object), props: Object)`

Action dispatcher to take full control over action dispatching by wrapping the internal dispatcher. It receives the original action, the internal dispatcher and all component props \(or options\). You probably want to invoke the internal dispatcher at some point.

> This is a power feature similar to the [state reducer pattern](https://kentcdodds.com/blog/the-state-reducer-pattern). It allows you to control state changes by intercepting actions before they are dispatched, to dispatch additional actions, possibly later in time.

### `debugLabel`

> `string`

A unique label to describe this React Async instance, used in React DevTools \(through `useDebugValue`\) and React Async DevTools.

### `suspense`

> `boolean`

Enables **experimental** Suspense integration. This will make React Async throw a promise while loading, so you can use Suspense to render a fallback UI, instead of using `<IfPending>`. Suspense differs in 2 main ways:

- `<Suspense>` should be an ancestor of your Async component, instead of a descendant. It can be anywhere up in the

  component hierarchy.

- You can have a single `<Suspense>` wrap multiple Async components, in which case it will render the fallback UI until

  all promises are settled.

> Note that the way Suspense is integrated right now may change. Until Suspense for data fetching is officially released, we may make breaking changes to its integration in React Async in a minor or patch release. Among other things, we'll probably add a cache of sorts.

### `defer`

> `boolean`

Enables the use of `deferFn` if `true`, or enables the use of `promiseFn` if `false`. By default this is automatically chosen based on the request method \(`deferFn` for POST / PUT / PATCH / DELETE, `promiseFn` otherwise\).

### `json`

> `boolean`

Enables or disables JSON parsing of the response body. By default this is automatically enabled if the `Accept` header is set to `"application/json"`.

## Render props

`<Async>` provides the following render props to the `children` function:

- [`data`](#data) Last resolved promise value, maintained when new error arrives.
- [`error`](#error) Rejected promise reason, cleared when new data arrives.
- [`value`](#value) The value of `data` or `error`, whichever was last updated.
- [`initialValue`](#initialvalue-1) The data or error that was provided through the `initialValue` prop.
- [`startedAt`](#startedat) When the current/last promise was started.
- [`finishedAt`](#finishedat) When the last promise was fulfilled or rejected.
- [`status`](#status) One of: `initial`, `pending`, `fulfilled`, `rejected`.
- [`isInitial`](#isinitial) true when no promise has ever started, or one started but was cancelled.
- [`isPending`](#ispending) true when a promise is currently awaiting settlement. Alias: `isLoading`
- [`isFulfilled`](#isfulfilled) true when the last promise was fulfilled. Alias: `isResolved`
- [`isRejected`](#isrejected) true when the last promise was rejected.
- [`isSettled`](#issettled) true when the last promise was fulfilled or rejected \(not initial or pending\).
- [`counter`](#counter) The number of times a promise was started.
- [`promise`](#promise-1) A reference to the internal wrapper promise, which can be chained on.
- [`run`](#run) Invokes the `deferFn`.
- [`reload`](#reload) Re-runs the promise when invoked, using any previous arguments.
- [`cancel`](#cancel) Cancel any pending promise.
- [`setData`](#setdata) Sets `data` to the passed value, unsets `error` and cancels any pending promise.
- [`setError`](#seterror) Sets `error` to the passed value and cancels any pending promise.

### `data`

> `any`

Last resolved promise value, maintained when new error arrives.

### `error`

> `Error`

Rejected promise reason, cleared when new data arrives.

### `value`

> `any | Error`

The data or error that was last provided \(either through `initialValue` or by settling a promise\).

### `initialValue`

> `any | Error`

The data or error that was originally provided through the `initialValue` prop.

### `startedAt`

> `Date`

Tracks when the current/last promise was started.

### `finishedAt`

> `Date`

Tracks when the last promise was resolved or rejected.

### `status`

> `string`

One of: `initial`, `pending`, `fulfilled`, `rejected`. These are available for import as `statusTypes`.

### `isInitial`

> `boolean`

`true` while no promise has started yet, or one was started but cancelled.

### `isPending`

> `boolean`

`true` while a promise is pending \(loading\), `false` otherwise.

Alias: `isLoading`

### `isFulfilled`

> `boolean`

`true` when the last promise was fulfilled \(resolved to a value\).

Alias: `isResolved`

### `isRejected`

> `boolean`

`true` when the last promise was rejected.

### `isSettled`

> `boolean`

`true` when the last promise was either fulfilled or rejected \(i.e. not initial or pending\)

### `counter`

> `number`

The number of times a promise was started.

### `promise`

> `Promise`

A reference to the internal wrapper promise created when starting a new promise \(either automatically or by invoking `run` / `reload`\). It fulfills or rejects along with the provided `promise` / `promiseFn` / `deferFn`. Useful as a chainable alternative to the `onResolve` / `onReject` callbacks.

Warning! If you chain on `promise`, you MUST provide a rejection handler \(e.g. `.catch(...)`\). Otherwise React will throw an exception and crash if the promise rejects.

### `run`

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

### `reload`

> `function(): void`

Re-runs the promise when invoked, using the previous arguments.

### `cancel`

> `function(): void`

Cancels the currently pending promise by ignoring its result and calls `abort()` on the AbortController.

### `setData`

> `function(data: any, callback?: () => void): any`

Function that sets `data` to the passed value, unsets `error` and cancels any pending promise. Takes an optional callback which is invoked after the state update is completed. Returns the data to enable chaining.

### `setError`

> `function(error: Error, callback?: () => void): Error`

Function that sets `error` to the passed value and cancels any pending promise. Takes an optional callback which is invoked after the state update is completed. Returns the error to enable chaining.
