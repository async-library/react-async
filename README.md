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
    <img src="https://img.shields.io/travis/ghengeveld/react-async.svg" alt="build status">
  </a>
  <a href="https://codecov.io/github/ghengeveld/react-async">
    <img src="https://img.shields.io/codecov/c/github/ghengeveld/react-async.svg" alt="code coverage">
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

React component for declarative promise resolution and data fetching. Leverages the Render Props pattern for ultimate
flexibility as well as the new Context API for ease of use. Makes it easy to handle loading and error states, without
assumptions about the shape of your data or the type of request.

- Zero dependencies
- Works with any (native) promise
- Choose between Render Props and Context-based helper components
- Provides convenient `isLoading`, `startedAt` and `finishedAt` metadata
- Provides `cancel` and `reload` actions
- Automatic re-run using `watch` prop
- Accepts `onResolve` and `onReject` callbacks
- Supports optimistic updates using `setData`
- Supports server-side rendering through `initialValue`
- Works well in React Native too!

> Versions 1.x and 2.x of `react-async` on npm are from a different project abandoned years ago. The original author was
> kind enough to transfer ownership so the `react-async` package name could be repurposed. The first version of
> React Async is v3.0.0.

## Rationale

React Async is different in that it tries to resolve data as close as possible to where it will be used, while using a
declarative syntax, using just JSX and native promises. This is in contrast to systems like Redux where you would
configure any data fetching or updates on a higher (application global) level, using a special construct
(actions/reducers).

React Async works really well even in larger applications with multiple or nested data dependencies. It encourages loading
data on-demand and in parallel at component level instead of in bulk at the route / page level. It's entirely decoupled
from your routes, so it works well in complex applications that have a dynamic routing model or don't use routes at all.

React Async is promise-based, so you can resolve anything you want, not just `fetch` requests.

## Install

```
npm install --save react-async
```

## Usage

Using render props for ultimate flexibility:

```js
import Async from "react-async"

const loadJson = () => fetch("/some/url").then(res => res.json())

const MyComponent = () => (
  <Async promiseFn={loadJson}>
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

Using helper components (don't have to be direct children) for ease of use:

```js
import Async from "react-async"

const loadJson = () => fetch("/some/url").then(res => res.json())

const MyComponent = () => (
  <Async promiseFn={loadJson}>
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

Creating a custom instance of Async, bound to a specific promiseFn:

```js
import { createInstance } from "react-async"

const loadCustomer = ({ customerId }) => fetch(`/api/customers/${customerId}`).then(...)

const AsyncCustomer = createInstance({ promiseFn: loadCustomer })

const MyComponent = () => (
  <AsyncCustomer customerId="123">
    <AsyncCustomer.Resolved>{customer => `Hello ${customer.name}`}</AsyncCustomer.Resolved>
  </AsyncCustomer>
)
```

Similarly, this allows you to set default `onResolve` and `onReject` callbacks.

## API

### Props

`<Async>` takes the following properties:

- `promiseFn` {() => Promise} A function that returns a promise; invoked in `componentDidMount` and `componentDidUpdate`; receives props (object) as argument
- `deferFn` {() => Promise} A function that returns a promise; invoked only by calling `run`, with arguments being passed through, as well as props (object) as final argument
- `watch` {any} Watches this property through `componentDidUpdate` and re-runs the `promiseFn` when the value changes (`oldValue !== newValue`)
- `initialValue` {any} initial state for `data` or `error` (if instance of Error); useful for server-side rendering
- `onResolve` {Function} Callback function invoked when a promise resolves, receives data as argument
- `onReject` {Function} Callback function invoked when a promise rejects, receives error as argument

> Be aware that updating `promiseFn` will trigger it to cancel any pending promise and load the new promise. Passing an
> arrow function will cause it to change and reload on every render of the parent component. You can avoid this by
> defining the `promiseFn` value **outside** of the render method. If you need to pass variables to the `promiseFn`,
> pass them as additional props to `<Async>`, as `promiseFn` will be invoked with these props. Alternatively you can
> use [memoization](https://github.com/alexreardon/memoize-one) to avoid unnecessary updates.

### Render props

`<Async>` provides the following render props:

- `data` {any} last resolved promise value, maintained when new error arrives
- `error` {Error} rejected promise reason, cleared when new data arrives
- `initialValue` {any} the data or error that was provided through the `initialValue` prop
- `isLoading` {boolean} `true` while a promise is pending
- `startedAt` {Date} when the current/last promise was started
- `finishedAt` {Date} when the last promise was resolved or rejected
- `cancel` {Function} ignores the result of the currently pending promise
- `run` {Function} runs the `deferFn`, passing any arguments provided
- `reload` {Function} re-runs the promise when invoked, using the previous arguments
- `setData` {Function} sets `data` to the passed value, unsets `error` and cancels any pending promise
- `setError` {Function} sets `error` to the passed value and cancels any pending promise

## Examples

### Basic data fetching with loading indicator, error state and retry

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

### Using `deferFn` to trigger an update (e.g. POST / PUT request)

```js
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

### Using both `promiseFn` and `deferFn` along with `setData` to implement optimistic updates

```js
const updateAttendance = attend => fetch(...).then(() => attend, () => !attend)

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

### Server-side rendering using `initialValue` (e.g. Next.js)

```js
static async getInitialProps() {
  // Resolve the promise server-side
  const sessions = await loadSessions()
  return { sessions }
}

render() {
  const { sessions } = this.props // injected by getInitialProps
  return (
    <Async promiseFn={loadSessions} initialValue={sessions}>
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

## Helper components

React Async provides several helper components that make your JSX even more declarative.
They don't have to be direct children of `<Async>` and you can use the same component several times.

### `<Async.Loading>`

Renders only while the promise is loading.

#### Props

- `initial` {boolean} Show only on initial load (data is undefined)
- `children` {Function|Node} Function which receives props object or React node

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

Renders only when the promise is resolved.

#### Props

- `persist` {boolean} Show old data while loading new data. By default it hides as soon as a new promise starts.
- `children` {Function|Node} Render function which receives data and props object or just a plain React node.

#### Examples

```js
<Async.Resolved persist>{data => <pre>{JSON.stringify(data)}</pre>}</Async.Resolved>
```

```js
<Async.Resolved>{({ finishedAt }) => `Last updated ${startedAt.toISOString()}`}</Async.Resolved>
```

### `<Async.Rejected>`

Renders only when the promise is rejected.

#### Props

- `persist` {boolean} Show old error while loading new data. By default it hides as soon as a new promise starts.
- `children` {Function|Node} Render function which receives error and props object or just a plain React node.

#### Examples

```js
<Async.Rejected persist>Oops.</Async.Rejected>
```

```js
<Async.Rejected>{error => `Unexpected error: ${error.message}`}</Async.Rejected>
```

### `<Async.Pending>`

Renders only while the deferred promise is still pending (not yet run).

#### Props

- `persist` {boolean} Show until we have data, even while loading or when an error occurred. By default it hides as soon as the promise starts loading.
- `children` {Function|Node} Function which receives props object or React node.

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

## Acknowledgements

Many thanks to Andrey Popp for handing over ownership of `react-async` on npm.
