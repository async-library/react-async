# Async components

The most common use case for React Async is data fetching. In single-page applications it's very common to dynamically
load some data from a backend. React Async makes it incredibly easy to set this up, without having to worry about the
details.

The mental model of React Async is component-first. Rather than loading data high up in your application and passing it
down to a component for display, you perform the data loading at the component level. Such a component is called an
async component. An async component can render its state in a meaningful way like any other component, or be logic-only.
In that case it doesn't render any UI but instead passes its state down to its children. Such separation of concerns is
good practice.

## Creating an async component with `useFetch`

The easiest way to create an async component for data fetching is through the
[`useFetch` hook](../api/interfaces.md#usefetch-hook):

```jsx
import React from "react"
import { useFetch } from "react-async"

const Person = ({ id }) => {
  const { data, error } = useFetch(`https://swapi.co/api/people/${id}/`, {
    headers: { accept: "application/json" },
  })
  if (error) return error.message
  if (data) return `Hi, my name is ${data.name}!`
  return null
}

const App = () => {
  return <Person id={1} />
}
```

## More flexibility with `useAsync`

For most data fetching needs, `useFetch` is sufficient. However, sometimes you may want to take full control, for
example if you want to combine multiple requests. In this case you can use the
[`useAsync` hook](../api/interfaces.md#useasync-hook).

The core concept of `useAsync` (and React Async in general), is the [`promiseFn`](../api/options.md#promisefn): a
function that returns a `Promise`. It's the fundamental concept for modelling asynchronous operations. It enables React
Async to take control over scheduling, the Promise lifecycle and things like (re)starting an operation on user action or
other changes. We've deliberately chosen the `Promise` as our primitive, because it's natively supported and has various
utility methods like `Promise.all`. That's also why you'll find our terminology closely follows the Promise [states and
fates].

The above example, written with `useAsync`, would look like this:

```jsx
import React from "react"
import { useAsync } from "react-async"

const fetchPerson = async ({ id }, { signal }) => {
  const response = await fetch(`https://swapi.co/api/people/${id}/`, { signal })
  if (!response.ok) throw new Error(response.status)
  return response.json()
}

const Person = ({ id }) => {
  const { data, error } = useAsync({ promiseFn: fetchPerson, id })
  if (error) return error.message
  if (data) return `Hi, my name is ${data.name}!`
  return null
}

const App = () => {
  return <Person id={1} />
}
```

Notice the incoming parameters to `fetchPerson`. The `promiseFn` will be invoked with a `props` object and an
`AbortController`. `props` are the options you passed to `useAsync`, which is why you can access the `id` property
using [object destructuring]. The `AbortController` is created by React Async to enable [abortable fetch], so the
underlying request will be aborted when the promise is cancelled (e.g. when a new one starts or we leave the page). We
have to pass its `AbortSignal` down to `fetch` in order to wire this up.

[states and fates]: https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md
[object destructuring]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring
[abortable fetch]: https://developers.google.com/web/updates/2017/09/abortable-fetch
