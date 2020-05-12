import * as React from "react"
import { useFetch } from "react-async"

export function FetchHookExample() {
  const result = useFetch<{ token: string }, {}>("https://reqres.in/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
  const { run } = result

  return (
    <>
      <h2>with fetch hook:</h2>
      <button onClick={run}>just run it without login data</button>
      <button
        onClick={() =>
          run(init => ({
            ...init,
            body: JSON.stringify({
              email: "eve.holt@reqres.in",
              password: "cityslicka",
            }),
          }))
        }
      >
        run it with valid login data (init callback)
      </button>
      <button
        onClick={() =>
          run({
            body: JSON.stringify({
              email: "eve.holt@reqres.in",
              password: "cityslicka",
            }),
          })
        }
      >
        run it with valid login data (init object)
      </button>
      <br />
      Status:
      <br />
      {result.isInitial && "initial"}
      {result.isLoading && "loading"}
      {result.isRejected && "rejected"}
      {result.isResolved && `token: ${result.data.token}`}
    </>
  )
}
