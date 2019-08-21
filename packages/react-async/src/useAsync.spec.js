/* eslint-disable react/prop-types */

import "@testing-library/jest-dom/extend-expect"
import React from "react"
import { render, fireEvent, cleanup } from "@testing-library/react"
import { useAsync, useFetch, globalScope } from "./index"
import {
  sleep,
  resolveTo,
  common,
  withPromise,
  withPromiseFn,
  withDeferFn,
  withReducer,
  withDispatcher,
} from "./specs"
import "../../../jest.setup"

const abortCtrl = { abort: jest.fn(), signal: "SIGNAL" }
globalScope.AbortController = jest.fn(() => abortCtrl)

const json = jest.fn(() => ({}))
globalScope.fetch = jest.fn(() => Promise.resolve({ ok: true, json }))

beforeEach(abortCtrl.abort.mockClear)
beforeEach(globalScope.fetch.mockClear)
beforeEach(json.mockClear)
afterEach(cleanup)

const Async = ({ children = () => null, ...props }) => children(useAsync(props))
const Fetch = ({ children = () => null, input, init, options }) =>
  children(useFetch(input, init, options))

describe("useAsync", () => {
  describe("common", common(Async))
  describe("with `promise`", withPromise(Async))
  describe("with `promiseFn`", withPromiseFn(Async, abortCtrl))
  describe("with `deferFn`", withDeferFn(Async, abortCtrl))
  describe("with `reducer`", withReducer(Async))
  describe("with `dispatcher`", withDispatcher(Async))

  test("accepts [promiseFn, options] shorthand, with the former taking precedence", async () => {
    const promiseFn1 = () => resolveTo("done")
    const promiseFn2 = () => resolveTo("nope")
    const Async = ({ children, ...props }) => children(useAsync(promiseFn1, props))
    const onResolve = jest.fn()
    const component = (
      <Async promiseFn={promiseFn2} onResolve={onResolve}>
        {({ data }) => data || null}
      </Async>
    )
    const { findByText } = render(component)
    await findByText("done")
    expect(onResolve).toHaveBeenCalledWith("done")
  })

  test("calling run() will always use the latest onResolve callback", async () => {
    const promiseFn = jest.fn(() => resolveTo())
    const deferFn = () => resolveTo()
    function App() {
      const [count, setCount] = React.useState(0)
      const { reload } = useAsync({
        promiseFn,
        count,
        watch: count,
      })
      const { run } = useAsync({
        deferFn,
        onResolve: reload,
      })
      return (
        <div>
          <button onClick={() => setCount(n => n + 1)}>inc</button>
          <button onClick={() => run()}>run</button>
        </div>
      )
    }
    const { getByText } = render(<App />)
    expect(promiseFn).toHaveBeenLastCalledWith(expect.objectContaining({ count: 0 }), abortCtrl)
    fireEvent.click(getByText("inc"))
    await sleep(10) // resolve promiseFn
    expect(promiseFn).toHaveBeenLastCalledWith(expect.objectContaining({ count: 1 }), abortCtrl)
    fireEvent.click(getByText("run"))
    await sleep(10) // resolve deferFn
    expect(promiseFn).toHaveBeenLastCalledWith(expect.objectContaining({ count: 1 }), abortCtrl)
  })

  test("calling run() will always use the latest onReject callback", async () => {
    const onReject1 = jest.fn()
    const onReject2 = jest.fn()
    const deferFn = ([count]) => Promise.reject(count)
    function App() {
      const [count, setCount] = React.useState(0)
      const onReject = count === 0 ? onReject1 : onReject2
      const { run } = useAsync({ deferFn, onReject })
      return <button onClick={() => run(count) && setCount(1)}>run</button>
    }
    const { getByText } = render(<App />)
    fireEvent.click(getByText("run"))
    await sleep(10) // resolve deferFn
    expect(onReject1).toHaveBeenCalledWith(0)
    fireEvent.click(getByText("run"))
    await sleep(10) // resolve deferFn
    expect(onReject2).toHaveBeenCalledWith(1)
  })
})

test("does not return a new `run` function on every render", async () => {
  const deferFn = () => resolveTo("done")
  const DeleteScheduleForm = () => {
    const [value, setValue] = React.useState()
    const { run } = useAsync({ deferFn })
    React.useEffect(() => value && run() && undefined, [value, run])
    return <button onClick={() => setValue(true)}>run</button>
  }
  const component = <DeleteScheduleForm />
  const { getByText } = render(component)
  fireEvent.click(getByText("run"))
})

describe("useFetch", () => {
  test("sets up a fetch request", () => {
    render(<Fetch input="/test" />)
    expect(globalScope.fetch).toHaveBeenCalledWith(
      "/test",
      expect.objectContaining({ signal: abortCtrl.signal })
    )
    expect(json).not.toHaveBeenCalled()
  })

  test("automatically switches to deferFn", () => {
    const component = (
      <Fetch input="/test" init={{ method: "POST" }}>
        {({ run }) => <button onClick={run}>run</button>}
      </Fetch>
    )
    const { getByText } = render(component)
    expect(globalScope.fetch).not.toHaveBeenCalled()
    fireEvent.click(getByText("run"))
    expect(globalScope.fetch).toHaveBeenCalledWith(
      "/test",
      expect.objectContaining({ method: "POST", signal: abortCtrl.signal })
    )
  })

  test("defer=true uses deferFn", () => {
    const component = (
      <Fetch input="/test" options={{ defer: true }}>
        {({ run }) => <button onClick={run}>run</button>}
      </Fetch>
    )
    const { getByText } = render(component)
    expect(globalScope.fetch).not.toHaveBeenCalled()
    fireEvent.click(getByText("run"))
    expect(globalScope.fetch).toHaveBeenCalledWith(
      "/test",
      expect.objectContaining({ signal: abortCtrl.signal })
    )
  })

  test("defer=false uses promiseFn", () => {
    render(
      <Fetch input="/test" init={{ method: "POST" }} options={{ defer: false }}>
        {({ run }) => <button onClick={run}>run</button>}
      </Fetch>
    )
    expect(globalScope.fetch).toHaveBeenCalledWith(
      "/test",
      expect.objectContaining({ method: "POST", signal: abortCtrl.signal })
    )
  })

  test("automatically handles JSON parsing", async () => {
    render(<Fetch input="/test" init={{ headers: { accept: "application/json" } }} />)
    await Promise.resolve()
    expect(json).toHaveBeenCalled()
  })

  test("json=false disables JSON parsing", async () => {
    render(
      <Fetch
        input="/test"
        init={{ headers: { accept: "application/json" } }}
        options={{ json: false }}
      />
    )
    await Promise.resolve()
    expect(json).not.toHaveBeenCalled()
  })

  test("json=true enables JSON parsing", async () => {
    render(<Fetch input="/test" options={{ json: true }} />)
    await Promise.resolve()
    expect(json).toHaveBeenCalled()
  })
})
