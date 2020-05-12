# Separating view and logic

It's generally good practice to separate view components from logic components. Async components should preferably be
logic-only. That means they don't render anything by themselves. Instead you can use the [render props] pattern to pass
down the async state:

```jsx
import React from "react"
import { useAsync } from "react-async"

const fetchPerson = async ({ id }, option, { signal }) => {
  const response = await fetch(`https://swapi.co/api/people/${id}/`, { signal })
  if (!response.ok) throw new Error(response.statusText)
  return response.json()
}

const Person = ({ id }) => {
  const state = useAsync({ promiseFn: fetchPerson, { context:  id }})
  return children(state)
}

const App = () => {
  return (
    <Person id={1}>
      {({ isPending, data, error }) => {
        if (isPending) return "Loading..."
        if (error) return <ErrorMessage {...error} />
        if (data) return <Greeting {...data} />
        return null
      }}
    </Person>
  )
}
```

> `ErrorMessage` and `Greeting` would be separate view components defined elsewhere.

[render props]: https://reactjs.org/docs/render-props.html

## Cleaning up the JSX

You'll notice the render props pattern is very powerful, but can also lead to code that's hard to read and understand.
To make your JSX more declarative and less cluttered, you can use the [`<Async>`](../api/interfaces.md#async-component)
component and its [state helpers](../api/helpers.md). These take away the need for `if/else` statements and `return`
keywords in your JSX.

```jsx
import React from "react"
import Async from "react-async"

const fetchPerson = async ({ id }, options, { signal }) => {
  const response = await fetch(`https://swapi.co/api/people/${id}/`, { signal })
  if (!response.ok) throw new Error(response.statusText)
  return response.json()
}

const App = () => {
  return (
    <Async promiseFn={fetchPerson} context={{ id: 1 }}>
      <Async.Pending>Loading...</Async.Pending>
      <Async.Rejected>{error => <ErrorMessage {...error} />}</Async.Rejected>
      <Async.Fulfilled>{data => <Greeting {...data} />}</Async.Fulfilled>
    </Async>
  )
}
```

You should know that these helper components do not have to be direct children of the `<Async>` component. Because they
are automatically wired up using [Context], they can be placed anywhere down the component tree, so long as they are
descendants. You can also use helpers of the same type, multiple times.

Stand-alone versions of `<Async.Pending>` and the like are also available. However, these must be wired up manually by
passing the `state` prop and are therefore only really useful when combined with one of the async hooks.

[context]: https://reactjs.org/docs/context.html
