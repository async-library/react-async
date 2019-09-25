import "@testing-library/jest-dom/extend-expect"
import React from "react"
import { render, fireEvent, cleanup } from "@testing-library/react"
import Async, { IfInitial, IfPending, IfFulfilled, IfRejected, IfSettled } from "./index"
import { resolveIn, resolveTo, rejectTo, sleep } from "./specs"

afterEach(cleanup)

describe("IfFulfilled", () => {
  test("renders only after the promise is resolved", async () => {
    const promiseFn = () => resolveTo("ok")
    const deferFn = () => rejectTo("fail")
    const { getByText, findByText, queryByText } = render(
      <Async promiseFn={promiseFn} deferFn={deferFn}>
        {state => (
          <>
            <IfFulfilled state={state}>
              {(data, { run }) => <button onClick={run}>{data}</button>}
            </IfFulfilled>
            <IfRejected state={state}>{error => error.message}</IfRejected>
          </>
        )}
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
        {state => (
          <>
            <IfFulfilled state={state} persist>
              {(data, { run }) => <button onClick={run}>{data}</button>}
            </IfFulfilled>
            <IfRejected state={state}>{error => error.message}</IfRejected>
          </>
        )}
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

  test("IfFulfilled works also with nested Async", async () => {
    const outer = () => resolveIn(0)("outer")
    const inner = () => resolveIn(100)("inner")
    const { findByText, queryByText } = render(
      <Async promiseFn={outer}>
        {state => (
          <IfFulfilled state={state}>
            {outer => (
              <Async promiseFn={inner}>
                {state => (
                  <>
                    <IfPending state={state}>{outer} pending</IfPending>
                    <IfFulfilled state={state}>{inner => outer + " " + inner}</IfFulfilled>
                  </>
                )}
              </Async>
            )}
          </IfFulfilled>
        )}
      </Async>
    )
    expect(queryByText("outer pending")).toBeNull()
    await findByText("outer pending")
    expect(queryByText("outer inner")).toBeNull()
    await findByText("outer inner")
    expect(queryByText("outer inner")).toBeInTheDocument()
  })
  test("renders nothing if missing state", () => {
    const { queryByText } = render(<IfFulfilled>Test</IfFulfilled>)
    expect(queryByText("Test")).not.toBeInTheDocument()
  })
  test("renders without children", async () => {
    const promiseFn = () => resolveTo("ok")
    render(<Async promiseFn={promiseFn}>{state => <IfFulfilled state={state} />}</Async>)
    await sleep(0)
  })
})

describe("IfPending", () => {
  test("renders only while the promise is pending", async () => {
    const promiseFn = () => resolveTo("ok")
    const { findByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        {state => (
          <>
            <IfPending state={state}>pending</IfPending>
            <IfFulfilled state={state}>done</IfFulfilled>
          </>
        )}
      </Async>
    )
    expect(queryByText("pending")).toBeInTheDocument()
    await findByText("done")
    expect(queryByText("pending")).toBeNull()
  })
  test("renders nothing if missing state", () => {
    const { queryByText } = render(<IfPending>Test</IfPending>)
    expect(queryByText("Test")).not.toBeInTheDocument()
  })
})

describe("IfInitial", () => {
  test("renders only while the deferred promise has not started yet", async () => {
    const deferFn = () => resolveTo("ok")
    const { getByText, findByText, queryByText } = render(
      <Async deferFn={deferFn}>
        {state => (
          <>
            <IfInitial state={state}>
              {({ run }) => <button onClick={run}>initial</button>}
            </IfInitial>
            <IfPending state={state}>pending</IfPending>
            <IfFulfilled state={state}>done</IfFulfilled>
          </>
        )}
      </Async>
    )
    expect(queryByText("initial")).toBeInTheDocument()
    fireEvent.click(getByText("initial"))
    expect(queryByText("initial")).toBeNull()
    expect(queryByText("pending")).toBeInTheDocument()
    await findByText("done")
    expect(queryByText("pending")).toBeNull()
  })
  test("renders nothing if missing state", () => {
    const { queryByText } = render(<IfInitial>Test</IfInitial>)
    expect(queryByText("Test")).not.toBeInTheDocument()
  })
})

describe("IfRejected", () => {
  test("renders only after the promise is rejected", async () => {
    const promiseFn = () => rejectTo("err")
    const { findByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        {state => <IfRejected state={state}>{error => error.message}</IfRejected>}
      </Async>
    )
    expect(queryByText("err")).toBeNull()
    await findByText("err")
    expect(queryByText("err")).toBeInTheDocument()
  })
  test("renders nothing if missing state", () => {
    const { queryByText } = render(<IfRejected>Test</IfRejected>)
    expect(queryByText("Test")).not.toBeInTheDocument()
  })
})

describe("IfSettled", () => {
  test("renders after the promise is fulfilled", async () => {
    const promiseFn = () => resolveTo("value")
    const { findByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        {state => <IfSettled state={state}>{({ data }) => data}</IfSettled>}
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
        {state => <IfSettled state={state}>{({ error }) => error.message}</IfSettled>}
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
        {state => (
          <>
            <IfPending state={state}>
              <IfSettled state={state} persist>
                loading
              </IfSettled>
            </IfPending>
            <IfSettled state={state}>
              {({ reload }) => <button onClick={reload}>reload</button>}
            </IfSettled>
          </>
        )}
      </Async>
    )
    expect(queryByText("loading")).toBeNull()
    fireEvent.click(getByText("reload"))
    await findByText("loading")
  })
  test("renders nothing if missing state", () => {
    const { queryByText } = render(<IfSettled>Test</IfSettled>)
    expect(queryByText("Test")).not.toBeInTheDocument()
  })
})
