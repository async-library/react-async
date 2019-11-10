/* eslint-disable react/prop-types */

import "@testing-library/jest-dom/extend-expect"
import React from "react"
import { render, fireEvent, cleanup } from "@testing-library/react"
import Async, { createInstance, globalScope } from "./index"
import {
  resolveIn,
  resolveTo,
  rejectTo,
  common,
  withPromise,
  withPromiseFn,
  withDeferFn,
  withReducer,
  withDispatcher,
} from "./specs"

const abortCtrl = { abort: jest.fn() }
globalScope.AbortController = jest.fn().mockImplementation(() => abortCtrl)

beforeEach(abortCtrl.abort.mockClear)
afterEach(cleanup)

describe("Async", () => {
  describe("common", common(Async))
  describe("with `promise`", withPromise(Async))
  describe("with `promiseFn`", withPromiseFn(Async, abortCtrl))
  describe("with `deferFn`", withDeferFn(Async, abortCtrl))
  describe("with `reducer`", withReducer(Async))
  describe("with `dispatcher`", withDispatcher(Async))

  test("an unrelated change in props does not update the Context", async () => {
    let one
    let two
    const { rerender } = render(
      <Async>
        <Async.Initial>
          {value => {
            one = value
            return null
          }}
        </Async.Initial>
      </Async>
    )
    rerender(
      <Async someProp>
        <Async.Initial>
          {value => {
            two = value
            return null
          }}
        </Async.Initial>
      </Async>
    )
    expect(one).toBe(two)
  })
})

describe("rendering context consumers without provider should throw an error", () => {
  for (const Component of [
    Async.Initial,
    Async.Pending,
    Async.Fulfilled,
    Async.Rejected,
    Async.Settled,
  ]) {
    test("does not throw an error when rendered within <Async>", () => {
      expect(() =>
        render(
          <Async>
            <Component>{() => null}</Component>
          </Async>
        )
      ).not.toThrowError()
    })
    test("does throw an error when not rendered within <Async>", () => {
      // Prevent the thrown error from showing up in test output by mocking console.error.
      jest.spyOn(console, "error")
      global.console.error.mockImplementation(() => {})

      expect(() => render(<Component>{() => null}</Component>)).toThrowError()

      // Restore the original console.error so other tests will still print errors that occur.
      global.console.error.mockRestore()
    })
  }
})

describe("Async.Fulfilled", () => {
  test("renders only after the promise is resolved", async () => {
    const promiseFn = () => resolveTo("ok")
    const deferFn = () => rejectTo("fail")
    const { getByText, findByText, queryByText } = render(
      <Async promiseFn={promiseFn} deferFn={deferFn}>
        <Async.Fulfilled>
          {(data, { run }) => <button onClick={run}>{data}</button>}
        </Async.Fulfilled>
        <Async.Rejected>{error => error.message}</Async.Rejected>
      </Async>
    )
    expect(queryByText("ok")).toBeNull()
    await findByText("ok")
    expect(queryByText("ok")).toBeInTheDocument()
    expect(queryByText("fail")).toBeNull()
    fireEvent.click(getByText("ok"))
    await findByText("fail")
    expect(queryByText("ok")).toBeNull()
    expect(queryByText("fail")).toBeInTheDocument()
  })

  test("with persist renders old data on error", async () => {
    const promiseFn = () => resolveTo("ok")
    const deferFn = () => rejectTo("fail")
    const { getByText, findByText, queryByText } = render(
      <Async promiseFn={promiseFn} deferFn={deferFn}>
        <Async.Fulfilled persist>
          {(data, { run }) => <button onClick={run}>{data}</button>}
        </Async.Fulfilled>
        <Async.Rejected>{error => error.message}</Async.Rejected>
      </Async>
    )
    expect(queryByText("ok")).toBeNull()
    await findByText("ok")
    expect(queryByText("ok")).toBeInTheDocument()
    expect(queryByText("fail")).toBeNull()
    fireEvent.click(getByText("ok"))
    await findByText("fail")
    expect(queryByText("ok")).toBeInTheDocument()
    expect(queryByText("fail")).toBeInTheDocument()
  })

  test("Async.Fulfilled works also with nested Async", async () => {
    const outer = () => resolveIn(0)("outer")
    const inner = () => resolveIn(100)("inner")
    const { findByText, queryByText } = render(
      <Async promiseFn={outer}>
        <Async.Fulfilled>
          {outer => (
            <Async promiseFn={inner}>
              <Async.Pending>{outer} pending</Async.Pending>
              <Async.Fulfilled>{inner => outer + " " + inner}</Async.Fulfilled>
            </Async>
          )}
        </Async.Fulfilled>
      </Async>
    )
    expect(queryByText("outer pending")).toBeNull()
    await findByText("outer pending")
    expect(queryByText("outer inner")).toBeNull()
    await findByText("outer inner")
    expect(queryByText("outer inner")).toBeInTheDocument()
  })
})

describe("Async.Pending", () => {
  test("renders only while the promise is pending", async () => {
    const promiseFn = () => resolveTo("ok")
    const { findByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        <Async.Pending>pending</Async.Pending>
        <Async.Fulfilled>done</Async.Fulfilled>
      </Async>
    )
    expect(queryByText("pending")).toBeInTheDocument()
    await findByText("done")
    expect(queryByText("pending")).toBeNull()
  })
})

describe("Async.Initial", () => {
  test("renders only while the deferred promise has not started yet", async () => {
    const deferFn = () => resolveTo("ok")
    const { getByText, findByText, queryByText } = render(
      <Async deferFn={deferFn}>
        <Async.Initial>{({ run }) => <button onClick={run}>initial</button>}</Async.Initial>
        <Async.Pending>pending</Async.Pending>
        <Async.Fulfilled>done</Async.Fulfilled>
      </Async>
    )
    expect(queryByText("initial")).toBeInTheDocument()
    fireEvent.click(getByText("initial"))
    expect(queryByText("initial")).toBeNull()
    expect(queryByText("pending")).toBeInTheDocument()
    await findByText("done")
    expect(queryByText("pending")).toBeNull()
  })
})

describe("Async.Rejected", () => {
  test("renders only after the promise is rejected", async () => {
    const promiseFn = () => rejectTo("err")
    const { findByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        <Async.Rejected>{error => error.message}</Async.Rejected>
      </Async>
    )
    expect(queryByText("err")).toBeNull()
    await findByText("err")
    expect(queryByText("err")).toBeInTheDocument()
  })
})

describe("Async.Settled", () => {
  test("renders after the promise is fulfilled", async () => {
    const promiseFn = () => resolveTo("value")
    const { findByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        <Async.Settled>{({ data }) => data}</Async.Settled>
      </Async>
    )
    expect(queryByText("value")).toBeNull()
    await findByText("value")
    expect(queryByText("value")).toBeInTheDocument()
  })

  test("renders after the promise is rejected", async () => {
    const promiseFn = () => rejectTo("err")
    const { findByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        <Async.Settled>{({ error }) => error.message}</Async.Settled>
      </Async>
    )
    expect(queryByText("err")).toBeNull()
    await findByText("err")
    expect(queryByText("err")).toBeInTheDocument()
  })

  test("renders while loading new data and persist=true", async () => {
    const promiseFn = () => resolveTo("value")
    const { getByText, findByText, queryByText } = render(
      <Async initialValue="init" promiseFn={promiseFn}>
        <Async.Pending>
          <Async.Settled persist>loading</Async.Settled>
        </Async.Pending>
        <Async.Settled>{({ reload }) => <button onClick={reload}>reload</button>}</Async.Settled>
      </Async>
    )
    expect(queryByText("loading")).toBeNull()
    fireEvent.click(getByText("reload"))
    await findByText("loading")
  })
})

describe("createInstance", () => {
  test("allows setting default props", async () => {
    const promiseFn = () => resolveTo("done")
    const onResolve = jest.fn()
    const CustomAsync = createInstance({ promiseFn, onResolve })
    const { findByText } = render(<CustomAsync>{({ data }) => data || null}</CustomAsync>)
    await findByText("done")
    expect(onResolve).toHaveBeenCalledWith("done")
  })

  test("accepts watchFn from defaultOptions and passes the defaultOptions along", async () => {
    const promiseFn = () => resolveTo("done")
    const watchFn = jest.fn()
    const CustomAsync = createInstance({ promiseFn, watchFn })
    const { findByText } = render(<CustomAsync>{({ data }) => data || null}</CustomAsync>)
    await findByText("done")
    expect(watchFn).toHaveBeenCalledWith(
      expect.objectContaining({ promiseFn, watchFn }),
      expect.objectContaining({ promiseFn, watchFn })
    )
  })

  test("custom instances also have helper components", async () => {
    const promiseFn = () => resolveTo("done")
    const CustomAsync = createInstance({ promiseFn })
    const { findByText } = render(
      <CustomAsync>
        <CustomAsync.Pending>pending</CustomAsync.Pending>
        <CustomAsync.Fulfilled>resolved</CustomAsync.Fulfilled>
      </CustomAsync>
    )
    await findByText("pending")
    await findByText("resolved")
  })

  test("custom instance also passes defaultOptions to deferFn", async () => {
    const deferFn = jest.fn().mockReturnValue(resolveTo())
    const CustomAsync = createInstance({ deferFn })

    let counter = 1
    const { getByText } = render(
      <CustomAsync foo="bar">
        {({ run }) => <button onClick={() => run("go", counter++)}>run</button>}
      </CustomAsync>
    )
    const expectedProps = { deferFn, foo: "bar" }
    expect(deferFn).not.toHaveBeenCalled()
    fireEvent.click(getByText("run"))
    expect(deferFn).toHaveBeenCalledWith(
      ["go", 1],
      expect.objectContaining(expectedProps),
      abortCtrl
    )
    fireEvent.click(getByText("run"))
    expect(deferFn).toHaveBeenCalledWith(
      ["go", 2],
      expect.objectContaining(expectedProps),
      abortCtrl
    )
  })

  test("custom instance correctly passes props to deferFn on reload", async () => {
    const deferFn = jest.fn().mockReturnValue(resolveTo())
    const CustomAsync = createInstance({ deferFn })

    let counter = 1
    const { getByText } = render(
      <CustomAsync foo="bar">
        {({ run, reload }) =>
          counter === 1 ? (
            <button onClick={() => run("go", counter++)}>run</button>
          ) : (
            <button onClick={reload}>reload</button>
          )
        }
      </CustomAsync>
    )
    const expectedProps = { deferFn, foo: "bar" }
    expect(deferFn).not.toHaveBeenCalled()
    fireEvent.click(getByText("run"))
    expect(deferFn).toHaveBeenCalledWith(
      ["go", 1],
      expect.objectContaining(expectedProps),
      abortCtrl
    )
    fireEvent.click(getByText("reload"))
    expect(deferFn).toHaveBeenCalledWith(
      ["go", 1],
      expect.objectContaining(expectedProps),
      abortCtrl
    )
  })

  test("allows setting displayName", () => {
    const promiseFn = () => resolveTo("done")
    const CustomAsync = createInstance({ promiseFn }, "CustomAsync")
    expect(CustomAsync.displayName).toBe("CustomAsync")
    expect(CustomAsync.Initial.displayName).toBe("CustomAsync.Initial")
    expect(CustomAsync.Pending.displayName).toBe("CustomAsync.Pending")
    expect(CustomAsync.Fulfilled.displayName).toBe("CustomAsync.Fulfilled")
    expect(CustomAsync.Rejected.displayName).toBe("CustomAsync.Rejected")
    expect(CustomAsync.Settled.displayName).toBe("CustomAsync.Settled")
  })
})
