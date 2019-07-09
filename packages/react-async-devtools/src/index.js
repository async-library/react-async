import React from "react"
import { actionTypes, reducer } from "react-async"

import { Root, Range, Checkbox, Label, Small, Ol, Li, Button } from "./components"

const root =
  (typeof self === "object" && self.self === self && self) ||
  (typeof global === "object" && global.global === global && global)

const state = {
  intercept: root.sessionStorage.getItem("intercept") === "true",
  latency: root.sessionStorage.getItem("latency") || "0",
  update: () => {},
}

root.__REACT_ASYNC__ = root.__REACT_ASYNC__ || {}
root.__REACT_ASYNC__.devToolsDispatcher = (action, dispatch) => {
  const run = () => {
    dispatch(action)
    state.update(action)
  }
  switch (action.type) {
    case actionTypes.start:
      if (state.intercept) {
        dispatch({ ...action, payload: undefined })
        state.update(action, run)
      } else run()
      break
    case actionTypes.fulfill:
    case actionTypes.reject:
      setTimeout(run, state.latency * 1000)
      break
    default:
      run()
  }
}

const DevTools = () => {
  const [instances, setInstances] = React.useState({})
  const [interceptState, setIntercept] = React.useState(state.intercept)
  const intercept = React.useRef(interceptState)
  const [latencyState, setLatency] = React.useState(state.latency)
  const delay = React.useRef(latencyState * 1000)

  state.update = (action, run) => {
    const label = action.meta.debugLabel
    setInstances(instances => ({
      ...instances,
      [label]: { label, state: reducer(instances[label], action), run },
    }))
  }
  const updateLatency = event => {
    root.sessionStorage.setItem("latency", event.target.value)
    delay.current = event.target.value * 1000
    state.latency = event.target.value
    setLatency(event.target.value)
  }
  const updateIntercept = event => {
    root.sessionStorage.setItem("intercept", event.target.checked ? "true" : "false")
    state.intercept = event.target.checked
    intercept.current = event.target.checked
    setIntercept(event.target.checked)
  }

  const states = Object.keys(instances).map(label => instances[label])
  const pending = states.filter(({ state }) => state.status === "pending")
  const fulfilled = states.filter(({ state }) => state.status === "fulfilled")
  const rejected = states.filter(({ state }) => state.status === "rejected")

  return (
    <Root>
      <Label>
        Latency:{" "}
        <b>
          {latencyState} {latencyState === "1" ? "second" : "seconds"}
        </b>
        <Range max="5" value={latencyState} onChange={updateLatency} />
      </Label>
      <Label>
        <Checkbox checked={interceptState} onChange={updateIntercept} />
        Pause new requests
      </Label>
      {pending.length > 0 && (
        <section>
          <Small>Pending</Small>
          <Ol>
            {pending.map(({ label, run }, index) => (
              <Li key={index}>
                {label} {run && <Button onClick={run}>run</Button>}
              </Li>
            ))}
          </Ol>
        </section>
      )}
      {fulfilled.length > 0 && (
        <section>
          <Small>Fulfilled</Small>
          <Ol>
            {fulfilled.map((promise, index) => (
              <Li key={index}>{promise.label}</Li>
            ))}
          </Ol>
        </section>
      )}
      {rejected.length > 0 && (
        <section>
          <Small>Rejected</Small>
          <Ol>
            {rejected.map((promise, index) => (
              <Li key={index}>{promise.label}</Li>
            ))}
          </Ol>
        </section>
      )}
    </Root>
  )
}

export default DevTools
