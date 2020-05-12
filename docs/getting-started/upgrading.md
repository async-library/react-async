# Upgrading

## Upgrade to v11

### promiseFn and deferFn unification

The `promiseFn` and the `deferFn` have been unified. They now share the following signature:

```ts
export type AsyncFn<T, C> = (
  context: C | undefined,
  props: AsyncProps<T, C>,
  controller: AbortController
) => Promise<T>
```

Before the `deferFn` and `promiseFn` had this signature:

```ts
export type PromiseFn<T> = (props: AsyncProps<T>, controller: AbortController) => Promise<T>

export type DeferFn<T> = (
  args: any[],
  props: AsyncProps<T>,
  controller: AbortController
) => Promise<T>
```

The difference is the idea of having a `context`, the context will contain all parameters
to `AsyncProps` which are not native to the `AsyncProps`. Before you could pass any parameter
to `AsyncProps` and it would pass them to the `deferFn` and `promiseFn`, now you need to use
the `context` instead.

For example before you could write:

```jsx
useAsync({ promiseFn: loadPlayer, playerId: 1 })
```

Now you must write:

```jsx
useAsync({ promiseFn: loadPlayer, context: { playerId: 1 }})
```

In the above example the context would be `{playerId: 1}`.

This means that `promiseFn` now expects three parameters instead of two.

So before in `< 10.0.0` you would do this:

```jsx
import { useAsync } from "react-async"

// Here loadPlayer has only two arguments
const loadPlayer = async (options, controller) => {
  const res = await fetch(`/api/players/${options.playerId}`, { signal: controller.signal })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

// With hooks
const MyComponent = () => {
  const state = useAsync({ promiseFn: loadPlayer, playerId: 1 })
}

// With the Async component
<Async promiseFn={loadPlayer} playerId={1} />
```

In `11.0.0` you need to account for the three parameters:

```jsx
import { useAsync } from "react-async"

// Now it has three arguments
const loadPlayer = async (context, options, controller) => {
  const res = await fetch(`/api/players/${context.playerId}`, { signal: controller.signal })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

// With hooks
const MyComponent = () => {
  const state = useAsync({ promiseFn: loadPlayer, context: { playerId: 1 } })
}

// With the Async component
<Async promiseFn={loadPlayer} context={{ playerId: 1 }} />
```

For the `deferFn` this means no longer expecting an array of arguments but instead a singular argument.
The `run` now accepts only one argument which is a singular value. All other arguments to `run` but
the first will be ignored.

So before in `< 10.0.0` you would do this:

```jsx
import Async from "react-async"

const getAttendance = () =>
  fetch("/attendance").then(
    () => true,
    () => false
  )
const updateAttendance = ([attend, userId]) =>
  fetch(`/attendance/${userId}`, { method: attend ? "POST" : "DELETE" }).then(
    () => attend,
    () => !attend
  )

const userId = 42

const AttendanceToggle = () => (
  <Async promiseFn={getAttendance} deferFn={updateAttendance}>
    {({ isPending, data: isAttending, run, setData }) => (
      <Toggle
        on={isAttending}
        onClick={() => {
          run(!isAttending, userId)
        }}
        disabled={isPending}
      />
    )}
  </Async>
)
```

In `11.0.0` you need to account for for the parameters not being an array:

```jsx
import Async from "react-async"

const getAttendance = () =>
  fetch("/attendance").then(
    () => true,
    () => false
  )
const updateAttendance = ({ attend, userId }) =>
  fetch(`/attendance/${userId}`, { method: attend ? "POST" : "DELETE" }).then(
    () => attend,
    () => !attend
  )

const userId = 42

const AttendanceToggle = () => (
  <Async promiseFn={getAttendance} deferFn={updateAttendance}>
    {({ isPending, data: isAttending, run, setData }) => (
      <Toggle
        on={isAttending}
        onClick={() => {
          run({ attend: isAttending, userId })
        }}
        disabled={isPending}
      />
    )}
  </Async>
)
```

### useAsync only accepts one prop

Before in `10.0.0` you could call useAsync with multiple parameters,
the first argument would then be the `promiseFn` like this:

```tsx
const state = useAsync(loadPlayer, { context: { playerId: 1 } })
```

In `11.0.0` there is only one parameter. So the overload no longer works and you need to write this instead:

```tsx
const state = useAsync({ promiseFn: loadPlayer, context: { playerId: 1 } })
```

### WatchFn

Another thing you need to be careful about is the `watchFn` you can no longer count on the fact that 
unknown parameters are put into the `AsyncProps`. Before `< 10.0.0` you would write:

```ts
useAsync({ 
  promiseFn, 
  count: 0, 
  watchFn: (props, prevProps) => props.count !== prevProps.count 
});
```

In `11.0.0` you need to use the `context` instead:

```ts
useAsync({ 
  promiseFn, 
  context: { count: 0 }, 
  watchFn: (props, prevProps) => props.context.count !== prevProps.context.count 
});
```

## Upgrade to v10

This is a major release due to the migration to TypeScript. While technically it shouldn't change anything, it might be a breaking change in certain situations. Theres also a bugfix for watchFn and a fix for legacy browsers.

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
