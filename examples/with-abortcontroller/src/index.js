import React from "react"
import { useAsync } from "react-async"
import DevTools from "react-async-devtools"
import ReactDOM from "react-dom"
import "./index.css"

const download = (args, props, controller) =>
  fetch(`https://reqres.in/api/users/1?delay=3`, { signal: controller.signal })
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

export const App = () => {
  const { run, cancel, isPending } = useAsync({ deferFn: download, debugLabel: "User 1" })
  return (
    <>
      {isPending ? <button onClick={cancel}>cancel</button> : <button onClick={run}>start</button>}
      {isPending ? (
        <p>Loading...</p>
      ) : (
        <p>Inspect network traffic to see requests being canceled.</p>
      )}
    </>
  )
}

if (process.env.NODE_ENV !== "test")
  ReactDOM.render(
    <>
      <DevTools />
      <App />
    </>,
    document.getElementById("root")
  )
