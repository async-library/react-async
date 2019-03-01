<p align="center">
  <a href="https://github.com/ghengeveld/react-async"><img src="./react-async.png" width="520" alt="React Async" /></a><br/>
  Handle promises with ease.
</p>
<br/>

<p align="center">
  <a href="https://www.npmjs.com/package/react-async">
    <img src="https://img.shields.io/npm/v/react-async.svg" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/react-async">
    <img src="https://img.shields.io/npm/dm/react-async.svg" alt="npm downloads">
  </a>
  <a href="https://bundlephobia.com/result?p=react-async">
    <img src="https://img.shields.io/bundlephobia/min/react-async.svg" alt="minified size">
  </a>
  <a href="https://travis-ci.org/ghengeveld/react-async">
    <img src="https://img.shields.io/travis/ghengeveld/react-async/master.svg" alt="build status">
  </a>
  <a href="https://codecov.io/github/ghengeveld/react-async">
    <img src="https://img.shields.io/codecov/c/github/ghengeveld/react-async/master.svg" alt="code coverage">
  </a>
  <a href="https://opensource.org/licenses/ISC">
    <img src="https://img.shields.io/npm/l/react-async.svg" alt="license">
  </a>
  <a href="https://github.com/ghengeveld/react-async/issues">
    <img src="https://img.shields.io/github/issues/ghengeveld/react-async.svg" alt="issues">
  </a>
  <a href="https://github.com/ghengeveld/react-async/pulls">
    <img src="https://img.shields.io/github/issues-pr/ghengeveld/react-async.svg" alt="pull requests">
  </a>
</p>

React component and hook for declarative promise resolution and data fetching. Leverages the Render Props pattern and
Hooks for ultimate flexibility as well as the new Context API for ease of use. Makes it easy to handle loading and
error states, without assumptions about the shape of your data or the type of request.

- Zero dependencies
- Works with promises, async/await and the Fetch API
- Choose between Render Props, Context-based helper components or the `useAsync` and `useFetch` hooks
- Provides convenient `isLoading`, `startedAt` and `finishedAt` metadata
- Provides `cancel` and `reload` actions
- Automatic re-run using `watch` or `watchFn` prop
- Accepts `onResolve` and `onReject` callbacks
- Supports [abortable fetch] by providing an AbortController
- Supports optimistic updates using `setData`
- Supports server-side rendering through `initialValue`
- Comes with type definitions for TypeScript
- Works well in React Native too!

[abortable fetch]: https://developers.google.com/web/updates/2017/09/abortable-fetch

> ## Upgrading to v4
>
> When upgrading to React Async v4, please note the following breaking API changes:
>
> - `deferFn` now receives an `args` array as the first argument, instead of arguments to `run` being spread at the front
>   of the arguments list. This enables better interop with TypeScript. You can use destructuring to keep using your
>   existing variables.
> - The shorthand version of `useAsync` now takes the `options` object as optional second argument. This used to be
>   `initialValue`, but was undocumented and inflexible.

# Table of Contents

- [Rationale](#rationale)
  - [Concurrent React and Suspense](#concurrent-react-and-suspense)
- [Installation](#installation)
- [Usage](#usage)
  - [As a hook](#as-a-hook)
    - [With `useFetch`](#with-usefetch)
  - [As a component](#as-a-component)
    - [With helper components](#with-helper-components)
  - [As a factory](#as-a-factory)
- [API](#api)
  - [Options](#options)
  - [Render props](#render-props)
- [Helper components](#helper-components)
- [Usage examples](#usage-examples)
  - [Data fetching](#data-fetching)
  - [Form submission](#form-submission)
  - [Optimistic updates](#optimistic-updates)
  - [Server-side rendering](#server-side-rendering)
- [Who's using React Async?](#whos-using-react-async)
- [Acknowledgements](#acknowledgements)

## Rationale

React Async is different in that it tries to resolve data as close as possible to where it will be used, while using a
declarative syntax, using just JSX and native promises. This is in contrast to systems like Redux where you would
configure any data fetching or updates on a higher (application global) level, using a special construct
(actions/reducers).

React Async works really well even in larger applications with multiple or nested data dependencies. It encourages loading
data on-demand and in parallel at component level instead of in bulk at the route / page level. It's entirely decoupled
from your routes, so it works well in complex applications that have a dynamic routing model or don't use routes at all.

React Async is promise-based, so you can resolve anything you want, not just `fetch` requests.

### Concurrent React and Suspense

The React team is currently working on a large rewrite called [Concurrent React], previously known as "Async React".
Part of this rewrite is Suspense, which is a generic way for components to suspend rendering while they load data from
a cache. It can render a fallback UI while loading data, much like `<Async.Loading>`.

React Async has no direct relation to Concurrent React. They are conceptually close, but not the same. React Async is
meant to make dealing with asynchronous business logic easier. Concurrent React will make those features have less
impact on performance and usability. When Suspense lands, React Async will make full use of Suspense features. In fact
you can already **start using React Async right now**, and in a later update you'll **get Suspense features for free**.

[concurrent react]: https://github.com/sw-yx/fresh-concurrent-react/blob/master/Intro.md#introduction-what-is-concurrent-react

## Installation

```
npm install --save react-async
```

Or with Yarn:

```
yarn add react-async
```

> This package requires `react` as a peer dependency. Please make sure to install that as well.
> If you want to use the `useAsync` hook, you'll need `react@16.8.0` or later.

## Usage

React Async offers three primary APIs: the `useAsync` hook, the `<Async>` component and the `createInstance`
factory function. Each has its unique benefits and downsides.

### As a hook

The `useAsync` hook (available [from React v16.8.0](https://reactjs.org/hooks)) offers direct access to React Async's
core functionality from within your own function components:

```js
import { useAsync } from "react-async"

const loadCustomer = async ({ customerId }, { signal }) => {
  const res = await fetch(`/api/customers/${customerId}`, { signal })
  if (!res.ok) throw new Error(res)
  return res.json()
}

const MyComponent = () => {
  const { data, error, isLoading } = useAsync({ promiseFn: loadCustomer, customerId: 1 })
  if (isLoading) return "Loading..."
  if (error) return `Something went wrong: ${error.message}`
  if (data)
    return (
      <div>
        <strong>Loaded some data:</strong>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  return null
}
```

Or using the shorthand version:

```js
const MyComponent = () => {
  const { data, error, isLoading } = useAsync(loadCustomer, options)
  // ...
}
```

#### With `useFetch`

Because fetch is so commonly used with `useAsync`, there's a dedicated `useFetch` hook for it:

```js
import { useFetch } from "react-async"

const MyComponent = () => {
  const headers = { Accept: "application/json" }
  const { data, error, isLoading, run } = useFetch("/api/example", { headers }, options)
  // This will setup a promiseFn with a fetch request and JSON deserialization.
}
```

`useFetch` takes the same arguments as [fetch] itself, as well as options to the underlying `useAsync` hook. `useFetch`
automatically uses `promiseFn` or `deferFn` based on the request method (`deferFn` for POST / PUT / PATCH / DELETE) and
handles JSON parsing if the `Accept` header is set to `"application/json"`.

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch

### As a component

The classic interface to React Async. Simply use <Async> directly in your JSX component tree, leveraging the render
props pattern:

```js
import Async from "react-async"

// Your promiseFn receives all props from Async and an AbortController instance
const loadCustomer = ({ customerId }, { signal }) =>
  fetch(`/api/customers/${customerId}`, { signal })
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

const MyComponent = () => (
  <Async promiseFn={loadCustomer} customerId={1}>
    {({ data, error, isLoading }) => {
      if (isLoading) return "Loading..."
      if (error) return `Something went wrong: ${error.message}`
      if (data)
        return (
          <div>
            <strong>Loaded some data:</strong>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )
      return null
    }}
  </Async>
)
```

#### With helper components

Several [helper components](#helper-components) are available for better legibility. These don't have to be direct
children of `<Async>`, because they use Context, offering full flexibility. You can even use render props and helper
components together.

```js
import Async from "react-async"

const loadCustomer = ({ customerId }, { signal }) =>
  fetch(`/api/customers/${customerId}`, { signal })
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

const MyComponent = () => (
  <Async promiseFn={loadCustomer} customerId={1}>
    <Async.Loading>Loading...</Async.Loading>
    <Async.Resolved>
      {data => (
        <div>
          <strong>Loaded some data:</strong>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </Async.Resolved>
    <Async.Rejected>{error => `Something went wrong: ${error.message}`}</Async.Rejected>
  </Async>
)
```

### As a factory

You can also create your own component instances, allowing you to preconfigure them with options such as default
`onResolve` and `onReject` callbacks.

```js
import { createInstance } from "react-async"

const loadCustomer = ({ customerId }, { signal }) =>
  fetch(`/api/customers/${customerId}`, { signal })
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

// createInstance takes a defaultProps object and a displayName (both optional)
const AsyncCustomer = createInstance({ promiseFn: loadCustomer }, "AsyncCustomer")

const MyComponent = () => (
  <AsyncCustomer customerId={1}>
    <AsyncCustomer.Resolved>{customer => `Hello ${customer.name}`}</AsyncCustomer.Resolved>
  </AsyncCustomer>
)
```

## API

### Options

These can be passed in an object to `useAsync()`, or as props to `<Async>` and custom instances.

- `promise` An already started Promise instance.
- `promiseFn` Function that returns a Promise, automatically invoked.
- `deferFn` Function that returns a Promise, manually invoked with `run`.
- `watch` Watch a value and automatically reload when it changes.
- `watchFn` Watch this function and automatically reload when it returns truthy.
- `initialValue` Provide initial data or error for server-side rendering.
- `onResolve` Callback invoked when Promise resolves.
- `onReject` Callback invoked when Promise rejects.

#### `promise`

> `Promise`

A Promise instance which has already started. It will simply add the necessary resolve/reject callbacks and set
`startedAt` to the time `promise` was first provided. Changing the value of `promise` will cancel any pending promise
and listen to the new one. If `promise` is initially undefined, the React Async state will be `pending`.

> Note that `reload` will not do anything when using `promise`. Use `promiseFn` instead.

#### `promiseFn`

> `function(props: object, controller: AbortController): Promise`

A function that returns a promise. It is automatically invoked in `componentDidMount` and `componentDidUpdate`.
The function receives all component props (or options) and an AbortController instance as arguments.

> Be aware that updating `promiseFn` will trigger it to cancel any pending promise and load the new promise. Passing an
> arrow function will cause it to change and reload on every render of the parent component. You can avoid this by
> defining the `promiseFn` value **outside** of the render method. If you need to pass variables to the `promiseFn`,
> pass them as additional props to `<Async>`, as `promiseFn` will be invoked with these props. Alternatively you can
> use [memoization](https://github.com/alexreardon/memoize-one) to avoid unnecessary updates.

#### `deferFn`

> `function(args: any[], props: object, controller: AbortController): Promise`

A function that returns a promise. This is invoked only by manually calling `run(...args)`. Receives the same arguments
as `promiseFn`, as well as any arguments to `run` which are passed through as an array. The `deferFn` is commonly used
to send data to the server following a user action, such as submitting a form. You can use this in conjunction with
`promiseFn` to fill the form with existing data, then updating it on submit with `deferFn`.

> Be aware that when using both `promiseFn` and `deferFn`, the shape of their resolved value should match, because they
> both update the same `data`.

#### `watch`

> `any`

Watches this property through `componentDidUpdate` and re-runs the `promiseFn` when the value changes, using a simple
reference check (`oldValue !== newValue`). If you need a more complex update check, use `watchFn` instead.

#### `watchFn`

> `function(props: object, prevProps: object): boolean | any`

Re-runs the `promiseFn` when this callback returns truthy (called on every update). Any default props specified by
`createInstance` are available too.

#### `initialValue`

> `any | Error`

Initial state for `data` or `error` (if instance of Error); useful for server-side rendering.

#### `onResolve`

> `function(data: any): void`

Callback function invoked when a promise resolves, receives data as argument.

#### `onReject`

> `function(reason: Error): void`

Callback function invoked when a promise rejects, receives rejection reason (error) as argument.

### Render props

`<Async>` provides the following render props to the `children` function:

- `data` Last resolved promise value, maintained when new error arrives.
- `error` Rejected promise reason, cleared when new data arrives.
- `initialValue` The data or error that was provided through the `initialValue` prop.
- `isLoading` Whether or not a Promise is currently pending.
- `startedAt` When the current/last promise was started.
- `finishedAt` When the last promise was resolved or rejected.
- `counter` The number of times a promise was started.
- `cancel` Cancel any pending promise.
- `run` Invokes the `deferFn`.
- `reload` Re-runs the promise when invoked, using the any previous arguments.
- `setData` Sets `data` to the passed value, unsets `error` and cancels any pending promise.
- `setError` Sets `error` to the passed value and cancels any pending promise.

#### `data`

> `any`

Last resolved promise value, maintained when new error arrives.

#### `error`

> `Error`

Rejected promise reason, cleared when new data arrives.

#### `initialValue`

> `any | Error`

The data or error that was originally provided through the `initialValue` prop.

#### `isLoading`

> `boolean`

`true` while a promise is pending, `false` otherwise.

#### `startedAt`

> `Date`

Tracks when the current/last promise was started.

#### `finishedAt`

> `Date`

Tracks when the last promise was resolved or rejected.

#### `counter`

> `number`

The number of times a promise was started.

#### `cancel`

> `function(): void`

Cancels the currently pending promise by ignoring its result and calls `abort()` on the AbortController.

#### `run`

> `function(...args: any[]): Promise`

Runs the `deferFn`, passing any arguments provided as an array.

#### `reload`

> `function(): void`

Re-runs the promise when invoked, using the previous arguments.

#### `setData`

> `function(data: any, callback?: () => void): any`

Function that sets `data` to the passed value, unsets `error` and cancels any pending promise. Takes an optional
callback which is invoked after the state update is completed. Returns the data to enable chaining.

#### `setError`

> `function(error: Error, callback?: () => void): Error`

Function that sets `error` to the passed value and cancels any pending promise. Takes an optional callback which is
invoked after the state update is completed. Returns the error to enable chaining.

## Helper components

React Async provides several helper components that make your JSX more declarative and less cluttered.
They don't have to be direct children of `<Async>` and you can use the same component several times.

### `<Async.Loading>`

This component renders only while the promise is loading (unsettled).

#### Props

- `initial` `boolean` Show only on initial load (when `data` is `undefined`).
- `children` `function(state: object): Node | Node` Render function or React Node.

#### Examples

```js
<Async.Loading initial>
  <p>This text is only rendered while performing the initial load.</p>
</Async.Loading>
```

```js
<Async.Loading>{({ startedAt }) => `Loading since ${startedAt.toISOString()}`}</Async.Loading>
```

### `<Async.Resolved>`

This component renders only when the promise is fulfilled with data (`data !== undefined`).

#### Props

- `persist` `boolean` Show old data while loading new data. By default it hides as soon as a new promise starts.
- `children` `function(data: any, state: object): Node | Node` Render function or React Node.

#### Examples

```js
<Async.Resolved persist>{data => <pre>{JSON.stringify(data)}</pre>}</Async.Resolved>
```

```js
<Async.Resolved>{({ finishedAt }) => `Last updated ${startedAt.toISOString()}`}</Async.Resolved>
```

### `<Async.Rejected>`

This component renders only when the promise is rejected.

#### Props

- `persist` `boolean` Show old error while loading new data. By default it hides as soon as a new promise starts.
- `children` `function(error: Error, state: object): Node | Node` Render function or React Node.

#### Examples

```js
<Async.Rejected persist>Oops.</Async.Rejected>
```

```js
<Async.Rejected>{error => `Unexpected error: ${error.message}`}</Async.Rejected>
```

### `<Async.Pending>`

Renders only while the deferred promise is still pending (not yet run), or you have not provided any promise.

#### Props

- `persist` `boolean` Show until we have data, even while loading or when an error occurred. By default it hides as soon as the promise starts loading.
- `children` `function(state: object): Node | Node` Render function or React Node.

#### Examples

```js
<Async deferFn={deferFn}>
  <Async.Pending>
    <p>This text is only rendered while `run` has not yet been invoked on `deferFn`.</p>
  </Async.Pending>
</Async>
```

```js
<Async.Pending persist>
  {({ error, isLoading, run }) => (
    <div>
      <p>This text is only rendered while the promise has not resolved yet.</p>
      <button onClick={run} disabled={!isLoading}>
        Run
      </button>
      {error && <p>{error.message}</p>}
    </div>
  )}
</Async.Pending>
```

## Usage examples

Here's several examples to give you an idea of what's possible with React Async. For fully working examples, please
check out the [`examples` directory](https://github.com/ghengeveld/react-async/tree/master/examples).

### Data fetching

This does some basic data fetching, including a loading indicator, error state and retry.

```js
class App extends Component {
  getSession = ({ sessionId }) => fetch(...)

  render() {
    // The promiseFn should be defined outside of render()
    return (
      <Async promiseFn={this.getSession} sessionId={123}>
        {({ data, error, isLoading, reload }) => {
          if (isLoading) {
            return <div>Loading...</div>
          }
          if (error) {
            return (
              <div>
                <p>{error.toString()}</p>
                <button onClick={reload}>try again</button>
              </div>
            )
          }
          if (data) {
            return <pre>{JSON.stringify(data, null, 2)}</pre>
          }
          return null
        }}
      </Async>
    )
  }
}
```

### Form submission

This uses `deferFn` to trigger an update (e.g. POST / PUT request) after a form submit.

```js
const subscribeToNewsletter = (args, props, controller) => fetch(...)

<Async deferFn={subscribeToNewsletter}>
  {({ error, isLoading, run }) => (
    <form onSubmit={run}>
      <input type="email" name="email" />
      <button type="submit" disabled={isLoading}>
        Subscribe
      </button>
      {error && <p>{error.toString()}</p>}
    </form>
  )}
</Async>
```

### Optimistic updates

This uses both `promiseFn` and `deferFn` along with `setData` to implement optimistic updates.

```js
const updateAttendance = ([attend]) => fetch(...).then(() => attend, () => !attend)

<Async promiseFn={getAttendance} deferFn={updateAttendance}>
  {({ data: isAttending, isLoading, run, setData }) => (
    <Toggle
      on={isAttending}
      onClick={() => {
        setData(!isAttending)
        run(!isAttending)
      }}
      disabled={isLoading}
    />
  )}
</Async>
```

### Server-side rendering

This uses `initialValue` to enable server-side rendering with Next.js.

```js
static async getInitialProps() {
  // Resolve the promise server-side
  const customers = await loadCustomers()
  return { customers }
}

render() {
  const { customers } = this.props // injected by getInitialProps
  return (
    <Async promiseFn={loadCustomers} initialValue={customers}>
      {({ data, error, isLoading, initialValue }) => { // initialValue is passed along for convenience
        if (isLoading) {
          return <div>Loading...</div>
        }
        if (error) {
          return <p>{error.toString()}</p>
        }
        if (data) {
          return <pre>{JSON.stringify(data, null, 2)}</pre>
        }
        return null
      }}
    </Async>
  )
}
```

## Who's using React Async?

<a href="https://xebia.com"><img src="https://user-images.githubusercontent.com/321738/52999660-a9949780-3426-11e9-9a7e-42b400f4ccbe.png" height="40" alt="Xebia" /></a> <a href="https://intergamma.nl"><img src="https://user-images.githubusercontent.com/321738/52999676-b5805980-3426-11e9-899e-6c9669176df4.png" height="40" alt="Intergamma" /></a>

Your organization here? [Let us know](https://github.com/ghengeveld/react-async/issues/22) you're using React Async!

## Acknowledgements

Versions 1.x and 2.x of `react-async` on npm are from a different project abandoned years ago. The original author was
kind enough to transfer ownership so the `react-async` package name could be repurposed. The first version of this
project is v3.0.0. Many thanks to Andrey Popp for handing over ownership of `react-async` on npm.
