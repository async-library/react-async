import React from "react"
import { useAsync } from "react-async"
import ReactDOM from "react-dom"
import "./index.css"

const download = (args, props, controller) =>
  fetch(`https://reqres.in/api/users/1?delay=3`, { signal: controller.signal })
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

const App = () => {
  const { run, cancel, isLoading } = useAsync({ deferFn: download })
  return (
    <>
      {isLoading ? <button onClick={cancel}>cancel</button> : <button onClick={run}>start</button>}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <p>Inspect network traffic to see requests being canceled.</p>
      )}
    </>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
