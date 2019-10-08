# Optimistic updates

A powerful pattern to improve your app's perceived performance is optimistic updates. When building an async action, you
might be able to predict the outcome of the operation. If so, you can implement optimistic updates by proactively
setting the `data` to the predicted value, when starting the async action. Once the action completes, it will update
`data` to the actual value, probably the same value as predicted.

The following example uses both `promiseFn` and `deferFn` along with [`setData`](api/state.md#setdata) to implement
optimistic updates.

```jsx
import Async from "react-async"

const getAttendance = () => fetch("/attendance").then(() => true, () => false)
const updateAttendance = ([attend]) =>
  fetch("/attendance", { method: attend ? "POST" : "DELETE" }).then(() => attend, () => !attend)

const AttendanceToggle = () => (
  <Async promiseFn={getAttendance} deferFn={updateAttendance}>
    {({ isPending, data: isAttending, run, setData }) => (
      <Toggle
        on={isAttending}
        onClick={() => {
          setData(!isAttending)
          run(!isAttending)
        }}
        disabled={isPending}
      />
    )}
  </Async>
)
```

Here we have a switch to toggle attentance for an event. Clicking the toggle will most likely succeed, so we can predict
the value it will have after completion (because we're just flipping a boolean).

Notice that React Async accepts both a `promiseFn` and a `deferFn` at the same time. This allows you to combine data
fetching with performing actions. A typical example of where this is useful is with forms, where you first want to
populate the fields with current values from the database, and send the new values back when submitting the form. Do
note that `promiseFn` and `deferFn` operate on the same `data`, so they should both resolve to a similar kind of value.
