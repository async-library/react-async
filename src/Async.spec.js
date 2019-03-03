/* eslint-disable react/prop-types */

import "jest-dom/extend-expect"
import React from "react"
import { render, fireEvent, cleanup, waitForElement } from "react-testing-library"
import Async, { createInstance } from "./index"
import {
  resolveIn,
  resolveTo,
  rejectTo,
  common,
  withPromise,
  withPromiseFn,
  withDeferFn,
} from "./common.spec"

const abortCtrl = { abort: jest.fn() }
window.AbortController = jest.fn().mockImplementation(() => abortCtrl)

beforeEach(abortCtrl.abort.mockClear)
afterEach(cleanup)

describe("Async", () => {
  describe("common", common(Async, abortCtrl))
  describe("with `promise`", withPromise(Async, abortCtrl))
  describe("with `promiseFn`", withPromiseFn(Async, abortCtrl))
  describe("with `deferFn`", withDeferFn(Async, abortCtrl))

  test("an unrelated change in props does not update the Context", async () => {
    let one
    let two
    const { rerender } = render(
      <Async>
        <Async.Pending>
          {value => {
            one = value
          }}
        </Async.Pending>
      </Async>
    )
    rerender(
      <Async someProp>
        <Async.Pending>
          {value => {
            two = value
          }}
        </Async.Pending>
      </Async>
    )
    expect(one).toBe(two)
  })
})

describe("Async.Resolved", () => {
  test("renders only after the promise is resolved", async () => {
    const promiseFn = () => resolveTo("ok")
    const deferFn = () => rejectTo("fail")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn} deferFn={deferFn}>
        <Async.Resolved>{(data, { run }) => <button onClick={run}>{data}</button>}</Async.Resolved>
        <Async.Rejected>{error => error}</Async.Rejected>
      </Async>
    )
    expect(queryByText("ok")).toBeNull()
    await waitForElement(() => getByText("ok"))
    expect(queryByText("ok")).toBeInTheDocument()
    expect(queryByText("fail")).toBeNull()
    fireEvent.click(getByText("ok"))
    await waitForElement(() => getByText("fail"))
    expect(queryByText("ok")).toBeNull()
    expect(queryByText("fail")).toBeInTheDocument()
  })

  test("with persist renders old data on error", async () => {
    const promiseFn = () => resolveTo("ok")
    const deferFn = () => rejectTo("fail")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn} deferFn={deferFn}>
        <Async.Resolved persist>
          {(data, { run }) => <button onClick={run}>{data}</button>}
        </Async.Resolved>
        <Async.Rejected>{error => error}</Async.Rejected>
      </Async>
    )
    expect(queryByText("ok")).toBeNull()
    await waitForElement(() => getByText("ok"))
    expect(queryByText("ok")).toBeInTheDocument()
    expect(queryByText("fail")).toBeNull()
    fireEvent.click(getByText("ok"))
    await waitForElement(() => getByText("fail"))
    expect(queryByText("ok")).toBeInTheDocument()
    expect(queryByText("fail")).toBeInTheDocument()
  })

  test("Async.Resolved works also with nested Async", async () => {
    const outer = () => resolveIn(0)("outer")
    const inner = () => resolveIn(100)("inner")
    const { getByText, queryByText } = render(
      <Async promiseFn={outer}>
        <Async.Resolved>
          {outer => (
            <Async promiseFn={inner}>
              <Async.Loading>{outer} loading</Async.Loading>
              <Async.Resolved>{inner => outer + " " + inner}</Async.Resolved>
            </Async>
          )}
        </Async.Resolved>
      </Async>
    )
    expect(queryByText("outer loading")).toBeNull()
    await waitForElement(() => getByText("outer loading"))
    expect(queryByText("outer inner")).toBeNull()
    await waitForElement(() => getByText("outer inner"))
    expect(queryByText("outer inner")).toBeInTheDocument()
  })
})

describe("Async.Loading", () => {
  test("renders only while the promise is loading", async () => {
    const promiseFn = () => resolveTo("ok")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        <Async.Loading>loading</Async.Loading>
        <Async.Resolved>done</Async.Resolved>
      </Async>
    )
    expect(queryByText("loading")).toBeInTheDocument()
    await waitForElement(() => getByText("done"))
    expect(queryByText("loading")).toBeNull()
  })
})

describe("Async.Pending", () => {
  test("renders only while the deferred promise is pending", async () => {
    const deferFn = () => resolveTo("ok")
    const { getByText, queryByText } = render(
      <Async deferFn={deferFn}>
        <Async.Pending>{({ run }) => <button onClick={run}>pending</button>}</Async.Pending>
        <Async.Loading>loading</Async.Loading>
        <Async.Resolved>done</Async.Resolved>
      </Async>
    )
    expect(queryByText("pending")).toBeInTheDocument()
    fireEvent.click(getByText("pending"))
    expect(queryByText("pending")).toBeNull()
    expect(queryByText("loading")).toBeInTheDocument()
    await waitForElement(() => getByText("done"))
    expect(queryByText("loading")).toBeNull()
  })
})

describe("Async.Rejected", () => {
  test("renders only after the promise is rejected", async () => {
    const promiseFn = () => rejectTo("err")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        <Async.Rejected>{err => err}</Async.Rejected>
      </Async>
    )
    expect(queryByText("err")).toBeNull()
    await waitForElement(() => getByText("err"))
    expect(queryByText("err")).toBeInTheDocument()
  })
})

describe("createInstance", () => {
  test("allows setting default props", async () => {
    const promiseFn = () => resolveTo("done")
    const onResolve = jest.fn()
    const CustomAsync = createInstance({ promiseFn, onResolve })
    const { getByText } = render(<CustomAsync>{({ data }) => data || null}</CustomAsync>)
    await waitForElement(() => getByText("done"))
    expect(onResolve).toHaveBeenCalledWith("done")
  })

  test("accepts watchFn from defaultProps and passes the defaultProps along", async () => {
    const promiseFn = () => resolveTo("done")
    const watchFn = jest.fn()
    const CustomAsync = createInstance({ promiseFn, watchFn })
    const { getByText } = render(<CustomAsync>{({ data }) => data || null}</CustomAsync>)
    await waitForElement(() => getByText("done"))
    expect(watchFn).toHaveBeenCalledWith(
      expect.objectContaining({ promiseFn, watchFn }),
      expect.objectContaining({ promiseFn, watchFn })
    )
  })

  test("custom instances also have helper components", async () => {
    const promiseFn = () => resolveTo("done")
    const CustomAsync = createInstance({ promiseFn })
    const { getByText } = render(
      <CustomAsync>
        <CustomAsync.Loading>loading</CustomAsync.Loading>
        <CustomAsync.Resolved>resolved</CustomAsync.Resolved>
      </CustomAsync>
    )
    await waitForElement(() => getByText("loading"))
    await waitForElement(() => getByText("resolved"))
  })

  test("custom instance also passes defaultProps to deferFn", async () => {
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
})
