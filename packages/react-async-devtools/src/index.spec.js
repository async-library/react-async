import "@testing-library/jest-dom/extend-expect"
import React from "react"
import { useAsync } from "react-async"
import { render, cleanup, fireEvent } from "@testing-library/react"
import DevTools from "./index"
import "../../../jest.setup"

const Async = props => {
  const { data, error, isPending } = useAsync(props)
  if (isPending) return "loading"
  if (error) return error
  if (data) return data
  return null
}

afterEach(cleanup)

describe("DevTools", () => {
  test("shows pending requests", async () => {
    const promiseFn = () => new Promise(() => {}) // never resolve
    const { findByText } = render(
      <>
        <DevTools />
        <Async promiseFn={promiseFn} debugLabel="example" />
      </>
    )
    await findByText("loading")
    await findByText("Pending")
    await findByText("example")
  })

  test("shows fulfilled requests", async () => {
    const promiseFn = () => Promise.resolve("done")
    const { findByText } = render(
      <>
        <DevTools />
        <Async promiseFn={promiseFn} debugLabel="example" />
      </>
    )
    await findByText("done")
    await findByText("Fulfilled")
    await findByText("example")
  })

  test("shows rejected requests", async () => {
    const promiseFn = () => Promise.reject("oops")
    const { findByText } = render(
      <>
        <DevTools />
        <Async promiseFn={promiseFn} debugLabel="example" />
      </>
    )
    await findByText("oops")
    await findByText("Rejected")
    await findByText("example")
  })

  test("allows toggling interception of requests", async () => {
    const promiseFn = () => Promise.resolve("done")
    const { getByText, getByLabelText, findByText, queryByText, rerender } = render(<DevTools />)
    fireEvent.click(getByLabelText("Pause new requests"))
    rerender(
      <>
        <DevTools />
        <Async promiseFn={promiseFn} debugLabel="example" />
      </>
    )
    await findByText("Pending")
    expect(queryByText("Fulfilled")).not.toBeInTheDocument()
    fireEvent.click(getByText("run"))
    await findByText("Fulfilled")
  })

  test("allows changing the latency", async () => {
    const { getByRole, findByText } = render(<DevTools />)
    await findByText("Latency:")
    await findByText("0 seconds")
    fireEvent.change(getByRole("slider"), { target: { value: 2 } })
    await findByText("2 seconds")
  })
})
