# Async actions

Fetching data for display alone isn't sufficient for most applications. You'll often also want to submit data back to
the server, or handle other types of asynchronous actions. To enable this, React Async has the concept of a
[`deferFn`](../api/options.md#deferfn).

Like `promiseFn`, a `deferFn` is a function that returns a Promise. The difference is that `deferFn` will not be
automatically invoked by React Async when rendering the component. Instead it will have to be triggered by calling the
[`run`](../api/state.md#run) function provided by React Async.

```jsx
import React, { useState } from "react"
import { useAsync } from "react-async"

const subscribe = ([email], props, { signal }) =>
  fetch("/newsletter", { method: "POST", body: JSON.stringify({ email }), signal })

const NewsletterForm = () => {
  const { isPending, error, run } = useAsync({ deferFn: subscribe })
  const [email, setEmail] = useState("")

  const handleSubmit = event => {
    event.preventDefault()
    run(email)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={event => setEmail(event.target.value)} />
      <button type="submit" disabled={isPending}>
        Subscribe
      </button>
      {error && <p>{error.message}</p>}
    </form>
  )
}
```

As you can see, the `deferFn` is invoked with 3 arguments: `args`, `props` and the AbortController. `args` is an array
representing the arguments that were passed to `run`. In this case we passed the `email`, so we can extract that from
the `args` array at the first index using [array destructuring] and pass it along to our `fetch` request.

[array destructuring]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring

## Sending data with `useFetch`

The above example can be simplified when we rely on [`useFetch`](../api/interfaces.md#usefetch-hook) instead of
constructing the request manually.

```jsx
import React, { useState } from "react"
import { useFetch } from "react-async"

const NewsletterForm = () => {
  const { isPending, error, run } = useFetch("/newsletter", { method: "POST" })
  const [email, setEmail] = useState("")

  const handleSubmit = event => {
    event.preventDefault()
    run({ body: JSON.stringify({ email }) })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={event => setEmail(event.target.value)} />
      <button type="submit" disabled={isPending}>
        Subscribe
      </button>
      {error && <p>{error.message}</p>}
    </form>
  )
}
```

The [`run`](../api/state.md#run) function for `useFetch` is a little special because it allows you to override the
request's resource and other params. This way you can pass in the body, add dynamic headers or override the URL.
