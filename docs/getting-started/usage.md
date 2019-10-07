# Usage

React Async offers three primary APIs: the `useAsync` hook, the `<Async>` component and the `createInstance` factory function. Each has its unique benefits and downsides.

## As a hook

The `useAsync` hook \(available [from React v16.8.0](https://reactjs.org/hooks)\) offers direct access to React Async's core functionality from within your own function components:

```jsx
import { useAsync } from "react-async"

// You can use async/await or any function that returns a Promise
const loadPlayer = async ({ playerId }, { signal }) => {
  const res = await fetch(`/api/players/${playerId}`, { signal })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

const MyComponent = () => {
  const { data, error, isPending } = useAsync({ promiseFn: loadPlayer, playerId: 1 })
  if (isPending) return "Loading..."
  if (error) return `Something went wrong: ${error.message}`
  if (data)
    return (
      <div>
        <strong>Player data:</strong>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  return null
}
```

> Using [helper components](usage.md#with-helper-components) can greatly improve readability of your render functions by not having to write all those conditional returns.

Or using the shorthand version:

```jsx
const MyComponent = () => {
  const { data, error, isPending } = useAsync(loadPlayer, options)
  // ...
}
```

### With `useFetch`

Because fetch is so commonly used with `useAsync`, there's a dedicated `useFetch` hook for it:

```jsx
import { useFetch } from "react-async"

const MyComponent = () => {
  const headers = { Accept: "application/json" }
  const { data, error, isPending, run } = useFetch("/api/example", { headers }, options)
  // This will setup a promiseFn with a fetch request and JSON deserialization.

  // you can later call `run` with an optional callback argument to
  // last-minute modify the `init` parameter that is passed to `fetch`
  function clickHandler() {
    run(init => ({
      ...init,
      headers: {
        ...init.headers,
        authentication: "...",
      },
    }))
  }

  // alternatively, you can also just use an object that will be spread over `init`.
  // please note that this is not deep-merged, so you might override properties present in the
  // original `init` parameter
  function clickHandler2() {
    run({ body: JSON.stringify(formValues) })
  }
}
```

`useFetch` takes the same arguments as [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) itself, as well as `options` to the underlying `useAsync` hook. The `options` object takes two special boolean properties: `defer` and `json`. These can be used to switch between `deferFn` and `promiseFn`, and enable JSON parsing. By default `useFetch` automatically uses `promiseFn` or `deferFn` based on the request method \(`deferFn` for POST / PUT / PATCH / DELETE\) and handles JSON parsing if the `Accept` header is set to `"application/json"`.

## As a component

The classic interface to React Async. Simply use `<Async>` directly in your JSX component tree, leveraging the render props pattern:

```jsx
import Async from "react-async"

// Your promiseFn receives all props from Async and an AbortController instance
const loadPlayer = async ({ playerId }, { signal }) => {
  const res = await fetch(`/api/players/${playerId}`, { signal })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

const MyComponent = () => (
  <Async promiseFn={loadPlayer} playerId={1}>
    {({ data, error, isPending }) => {
      if (isPending) return "Loading..."
      if (error) return `Something went wrong: ${error.message}`
      if (data)
        return (
          <div>
            <strong>Player data:</strong>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )
      return null
    }}
  </Async>
)
```

> Using [helper components](usage.md#with-helper-components) can greatly improve readability of your render functions by not having to write all those conditional returns.

## As a factory

You can also create your own component instances, allowing you to preconfigure them with options such as default `onResolve` and `onReject` callbacks.

```jsx
import { createInstance } from "react-async"

const loadPlayer = async ({ playerId }, { signal }) => {
  const res = await fetch(`/api/players/${playerId}`, { signal })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

// createInstance takes a defaultOptions object and a displayName (both optional)
const AsyncPlayer = createInstance({ promiseFn: loadPlayer }, "AsyncPlayer")

const MyComponent = () => (
  <AsyncPlayer playerId={1}>
    <AsyncPlayer.Fulfilled>{player => `Hello ${player.name}`}</AsyncPlayer.Fulfilled>
  </AsyncPlayer>
)
```

## With helper components

Several [helper components](usage.md#helper-components) are available to improve legibility. They can be used with `useAsync` by passing in the state, or with `<Async>` by using Context. Each of these components simply enables or disables rendering of its children based on the current state.

```jsx
import { useAsync, IfPending, IfFulfilled, IfRejected } from "react-async"

const loadPlayer = async ({ playerId }, { signal }) => {
  // ...
}

const MyComponent = () => {
  const state = useAsync({ promiseFn: loadPlayer, playerId: 1 })
  return (
    <>
      <IfPending state={state}>Loading...</IfPending>
      <IfRejected state={state}>{error => `Something went wrong: ${error.message}`}</IfRejected>
      <IfFulfilled state={state}>
        {data => (
          <div>
            <strong>Player data:</strong>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </IfFulfilled>
    </>
  )
}
```

### As compounds to `<Async>`

Each of the helper components are also available as static properties of `<Async>`. In this case you won't have to pass the state object, instead it will be automatically provided through Context.

```jsx
import Async from "react-async"

const loadPlayer = async ({ playerId }, { signal }) => {
  const res = await fetch(`/api/players/${playerId}`, { signal })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

const MyComponent = () => (
  <Async promiseFn={loadPlayer} playerId={1}>
    <Async.Pending>Loading...</Async.Pending>
    <Async.Fulfilled>
      {data => (
        <div>
          <strong>Player data:</strong>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </Async.Fulfilled>
    <Async.Rejected>{error => `Something went wrong: ${error.message}`}</Async.Rejected>
  </Async>
)
```
