import "@testing-library/jest-dom/extend-expect"
import React from "react"
import { render, fireEvent, cleanup, waitForElement } from "@testing-library/react"
import Async, { Initial, Pending, Fulfilled, Rejected, Settled } from "./index"
import { resolveIn, resolveTo, rejectTo } from "./specs"

afterEach(cleanup)

describe("Fulfilled", () => {
  test("renders only after the promise is resolved", async () => {
    const promiseFn = () => resolveTo("ok")
    const deferFn = () => rejectTo("fail")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn} deferFn={deferFn}>
        {state => (
          <>
            <Fulfilled state={state}>
              {(data, { run }) => <button onClick={run}>{data}</button>}
            </Fulfilled>
            <Rejected state={state}>{error => error.message}</Rejected>
          </>
        )}
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
        {state => (
          <>
            <Fulfilled state={state} persist>
              {(data, { run }) => <button onClick={run}>{data}</button>}
            </Fulfilled>
            <Rejected state={state}>{error => error.message}</Rejected>
          </>
        )}
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

  test("Fulfilled works also with nested Async", async () => {
    const outer = () => resolveIn(0)("outer")
    const inner = () => resolveIn(100)("inner")
    const { getByText, queryByText } = render(
      <Async promiseFn={outer}>
        {state => (
          <Fulfilled state={state}>
            {outer => (
              <Async promiseFn={inner}>
                {state => (
                  <>
                    <Pending state={state}>{outer} pending</Pending>
                    <Fulfilled state={state}>{inner => outer + " " + inner}</Fulfilled>
                  </>
                )}
              </Async>
            )}
          </Fulfilled>
        )}
      </Async>
    )
    expect(queryByText("outer pending")).toBeNull()
    await waitForElement(() => getByText("outer pending"))
    expect(queryByText("outer inner")).toBeNull()
    await waitForElement(() => getByText("outer inner"))
    expect(queryByText("outer inner")).toBeInTheDocument()
  })
})

describe("Pending", () => {
  test("renders only while the promise is pending", async () => {
    const promiseFn = () => resolveTo("ok")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        {state => (
          <>
            <Pending state={state}>pending</Pending>
            <Fulfilled state={state}>done</Fulfilled>
          </>
        )}
      </Async>
    )
    expect(queryByText("pending")).toBeInTheDocument()
    await waitForElement(() => getByText("done"))
    expect(queryByText("pending")).toBeNull()
  })
})

describe("Initial", () => {
  test("renders only while the deferred promise has not started yet", async () => {
    const deferFn = () => resolveTo("ok")
    const { getByText, queryByText } = render(
      <Async deferFn={deferFn}>
        {state => (
          <>
            <Initial state={state}>{({ run }) => <button onClick={run}>initial</button>}</Initial>
            <Pending state={state}>pending</Pending>
            <Fulfilled state={state}>done</Fulfilled>
          </>
        )}
      </Async>
    )
    expect(queryByText("initial")).toBeInTheDocument()
    fireEvent.click(getByText("initial"))
    expect(queryByText("initial")).toBeNull()
    expect(queryByText("pending")).toBeInTheDocument()
    await waitForElement(() => getByText("done"))
    expect(queryByText("pending")).toBeNull()
  })
})

describe("Rejected", () => {
  test("renders only after the promise is rejected", async () => {
    const promiseFn = () => rejectTo("err")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        {state => <Rejected state={state}>{error => error.message}</Rejected>}
      </Async>
    )
    expect(queryByText("err")).toBeNull()
    await waitForElement(() => getByText("err"))
    expect(queryByText("err")).toBeInTheDocument()
  })
})

describe("Settled", () => {
  test("renders after the promise is fulfilled", async () => {
    const promiseFn = () => resolveTo("value")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        {state => <Settled state={state}>{({ data }) => data}</Settled>}
      </Async>
    )
    expect(queryByText("value")).toBeNull()
    await waitForElement(() => getByText("value"))
    expect(queryByText("value")).toBeInTheDocument()
  })

  test("renders after the promise is rejected", async () => {
    const promiseFn = () => rejectTo("err")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        {state => <Settled state={state}>{({ error }) => error.message}</Settled>}
      </Async>
    )
    expect(queryByText("err")).toBeNull()
    await waitForElement(() => getByText("err"))
    expect(queryByText("err")).toBeInTheDocument()
  })

  test("renders while loading new data and persist=true", async () => {
    const promiseFn = () => resolveTo("value")
    const { getByText, queryByText } = render(
      <Async initialValue="init" promiseFn={promiseFn}>
        {state => (
          <>
            <Pending state={state}>
              <Settled state={state} persist>
                loading
              </Settled>
            </Pending>
            <Settled state={state}>
              {({ reload }) => <button onClick={reload}>reload</button>}
            </Settled>
          </>
        )}
      </Async>
    )
    expect(queryByText("loading")).toBeNull()
    fireEvent.click(getByText("reload"))
    await waitForElement(() => getByText("loading"))
    expect(queryByText("loading")).toBeInTheDocument()
  })
})
