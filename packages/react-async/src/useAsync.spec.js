/* eslint-disable react/prop-types */

import "jest-dom/extend-expect"
import React from "react"
import { render, fireEvent, cleanup, waitForElement } from "@testing-library/react"
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
    const { getByText } = render(component)
    await waitForElement(() => getByText("done"))
    expect(onResolve).toHaveBeenCalledWith("done")
  })

  test("calling run() will always use the latest onResolve/onReject callbacks", async () => {
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

  test("skips the initial fetch if skipOnMount passed", async () => {
    const promiseFn = () => resolveTo("foo")
    const Component = ({ bar }) => {
      const foo = useAsync({ promiseFn, watch: bar, skipOnMount: true })
      return (
        <div>
          {bar} {foo.data ? foo.data : "undefined"}
        </div>
      )
    }

    const { rerender, getByText, queryByText } = render(<Component bar="1" />)

    await waitForElement(() => getByText("1 undefined"))
    expect(queryByText("1 undefined")).toBeInTheDocument()

    rerender(<Component bar="2" />)

    await waitForElement(() => getByText("2 foo"))

    expect(queryByText("2 foo")).toBeInTheDocument()
    expect(queryByText("1 undefined")).toBeNull()
  })
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
