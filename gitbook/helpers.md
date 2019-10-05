# Helper components

React Async provides several helper components that make your JSX more declarative and less cluttered.
They don't have to be direct children of `<Async>` and you can use the same component several times.

## `<IfInitial>` / `<Async.Initial>`

Renders only while the deferred promise is still waiting to be run, or you have not provided any promise.

### Props

- `children` `function(state: Object): Node | Node` Render function or React Node.
- `state` `object` Async state object (return value of `useAsync()`).
- `persist` `boolean` Show until we have data, even while loading or when an error occurred. By default it hides as soon
  as the promise starts loading.

### Examples

```jsx
const state = useAsync(...)
return (
  <IfInitial state={state}>
    <p>This text is only rendered while `run` has not yet been invoked on `deferFn`.</p>
  </IfInitial>
)
```

```jsx
<Async deferFn={deferFn}>
  <Async.Initial>
    <p>This text is only rendered while `run` has not yet been invoked on `deferFn`.</p>
  </Async.Initial>
</Async>
```

```jsx
<Async.Initial persist>
  {({ error, isPending, run }) => (
    <div>
      <p>This text is only rendered while the promise has not fulfilled yet.</p>
      <button onClick={run} disabled={!isPending}>
        Run
      </button>
      {error && <p>{error.message}</p>}
    </div>
  )}
</Async.Initial>
```

## `<IfPending>` / `<Async.Pending>`

This component renders only while the promise is pending (loading / unsettled).

Alias: `<Async.Loading>`

### Props

- `children` `function(state: Object): Node | Node` Render function or React Node.
- `state` `object` Async state object (return value of `useAsync()`).
- `initial` `boolean` Show only on initial load (when `data` is `undefined`).

### Examples

```jsx
const state = useAsync(...)
return (
  <IfPending state={state}>
    <p>This text is only rendered while performing the initial load.</p>
  </IfPending>
)
```

```jsx
<Async.Pending initial>
  <p>This text is only rendered while performing the initial load.</p>
</Async.Pending>
```

```jsx
<Async.Pending>{({ startedAt }) => `Loading since ${startedAt.toISOString()}`}</Async.Pending>
```

## `<IfFulfilled>` / `<Async.Fulfilled>`

This component renders only when the promise is fulfilled (resolved to a value, could be `undefined`).

Alias: `<Async.Resolved>`

### Props

- `children` `function(data: any, state: Object): Node | Node` Render function or React Node.
- `state` `object` Async state object (return value of `useAsync()`).
- `persist` `boolean` Show old data while loading new data. By default it hides as soon as a new promise starts.

### Examples

```jsx
const state = useAsync(...)
return (
  <IfFulfilled state={state}>
    {data => <pre>{JSON.stringify(data)}</pre>}
  </IfFulfilled>
)
```

```jsx
<Async.Fulfilled persist>{data => <pre>{JSON.stringify(data)}</pre>}</Async.Fulfilled>
```

```jsx
<Async.Fulfilled>
  {(data, { finishedAt }) => `Last updated ${finishedAt.toISOString()}`}
</Async.Fulfilled>
```

## `<IfRejected>` / `<Async.Rejected>`

This component renders only when the promise is rejected.

### Props

- `children` `function(error: Error, state: Object): Node | Node` Render function or React Node.
- `state` `object` Async state object (return value of `useAsync()`).
- `persist` `boolean` Show old error while loading new data. By default it hides as soon as a new promise starts.
