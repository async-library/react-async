import React from "react"

import "./DevTools.css"

const DevTools = () => {
  const [latency, setLatency] = React.useState("0")
  const [intercept, setIntercept] = React.useState(true)
  const pending = [{ label: "/user/2" }]
  const fulfilled = [{ label: "/user/1" }]
  const rejected = [{ label: "/user/0" }]

  return (
    <div className="devTools">
      <div>
        Latency:{" "}
        <b>
          {latency} {latency === "1" ? "second" : "seconds"}
        </b>
      </div>
      <input type="range" max="5" value={latency} onChange={e => setLatency(e.target.value)} />
      <label>
        <input type="checkbox" checked={intercept} onChange={e => setIntercept(e.target.checked)} />{" "}
        Pause new requests
      </label>
      {pending.length > 0 && (
        <section>
          <small>Pending</small>
          <ol>
            {pending.map((promise, index) => (
              <li key={index}>{promise.label}</li>
            ))}
          </ol>
        </section>
      )}
      {fulfilled.length > 0 && (
        <section>
          <small>Fulfilled</small>
          <ol>
            {fulfilled.map((promise, index) => (
              <li key={index}>{promise.label}</li>
            ))}
          </ol>
        </section>
      )}
      {rejected.length > 0 && (
        <section>
          <small>Rejected</small>
          <ol>
            {rejected.map((promise, index) => (
              <li key={index}>{promise.label}</li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}

export default DevTools
