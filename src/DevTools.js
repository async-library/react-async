import React from "react"
import { actionTypes, reducer } from "./reducer"
import "./DevTools.css"

window.__REACT_ASYNC__ = { ...window.__REACT_ASYNC__ }

const settings = {
  intercept: window.sessionStorage.getItem("intercept") === "true",
  latency: window.sessionStorage.getItem("latency") || "0",
}

const DevTools = () => {
  const [instances, setInstances] = React.useState({})
  const [interceptState, setIntercept] = React.useState(settings.intercept)
  const intercept = React.useRef(interceptState)
  const [latencyState, setLatency] = React.useState(settings.latency)
  const delay = React.useRef(latencyState * 1000)

  const updateState = (action, run) => {
    const label = action.meta.debugLabel
    setInstances(instances => ({
      ...instances,
      [label]: { label, state: reducer(instances[label], action), run },
    }))
  }
  const updateLatency = event => {
    window.sessionStorage.setItem("latency", event.target.value)
    delay.current = event.target.value * 1000
    setLatency(event.target.value)
  }
  const updateIntercept = event => {
    window.sessionStorage.setItem("intercept", event.target.checked ? "true" : "false")
    intercept.current = event.target.checked
    setIntercept(event.target.checked)
  }

  window.__REACT_ASYNC__.devToolsDispatcher = React.useCallback((action, dispatch) => {
    const run = () => {
      dispatch(action)
      updateState(action)
    }
    switch (action.type) {
      case actionTypes.start:
        if (intercept.current) {
          dispatch({ ...action, payload: undefined })
          updateState(action, run)
        } else run()
        break
      case actionTypes.fulfill:
      case actionTypes.reject:
        setTimeout(run, delay.current)
        break
      default:
        run()
    }
  }, [])

  const states = Object.keys(instances).map(label => instances[label])
  const pending = states.filter(({ state }) => state.status === "pending")
  const fulfilled = states.filter(({ state }) => state.status === "fulfilled")
  const rejected = states.filter(({ state }) => state.status === "rejected")

  return (
    <div className="devTools">
      <div>
        Latency:{" "}
        <b>
          {latencyState} {latencyState === "1" ? "second" : "seconds"}
        </b>
      </div>
      <input type="range" max="5" value={latencyState} onChange={updateLatency} />
      <label>
        <input type="checkbox" checked={interceptState} onChange={updateIntercept} />
        Pause new requests
      </label>
      {pending.length > 0 && (
        <section>
          <small>Pending</small>
          <ol>
            {pending.map(({ label, run }, index) => (
              <li key={index}>
                {label} {run && <button onClick={run}>run</button>}
              </li>
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