# Server-side rendering

There's a good chance you're using React with Server-side rendering (SSR), as many applications require this to be
successful. If you happen to be using Next.js, it's really easy to integrate React Async. The crux is in setting a
[`initialValue`](../api/options.md#initialvalue), which is fetched server-side for initial page loads and passed along
through rehydration.

```jsx
import fetch from "isomorphic-unfetch"

const fetchPerson = async ({ id }) => {
  const response = await fetch(`https://swapi.co/api/people/${id}/`)
  if (!response.ok) throw new Error(response.status)
  return response.json()
}

const Person = ({ id, person }) => (
  <Async promiseFn={fetchPerson} initialValue={person} id={id}>
    <Async.Pending>Loading...</Async.Pending>
    <Async.Rejected>{error => <ErrorMessage {...error} />}</Async.Rejected>
    <Async.Fulfilled>{data => <Greeting {...data} />}</Async.Fulfilled>
  </Async>
)

Person.getInitialProps = async ({ req }) => {
  const id = req.params.id
  const person = await fetchPerson({ id })
  return { id, person }
}
```

If React Async is provided an `initialValue`, it will not invoke the `promiseFn` on mount. Instead it will use the
`initialValue` to immediately set `data` or `error`, and render accordingly.
