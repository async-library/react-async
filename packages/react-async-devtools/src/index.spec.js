import "jest-dom/extend-expect"
import React from "react"
import { useAsync } from "react-async"
import { render, cleanup, waitForElement, fireEvent } from "@testing-library/react"
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
    const { getByText } = render(
      <>
        <DevTools />
        <Async promiseFn={promiseFn} debugLabel="example" />
      </>
    )
    await waitForElement(() => getByText("loading"))
    await waitForElement(() => getByText("Pending"))
    await waitForElement(() => getByText("example"))
  })

  test("shows fulfilled requests", async () => {
    const promiseFn = () => Promise.resolve("done")
    const { getByText } = render(
      <>
        <DevTools />
        <Async promiseFn={promiseFn} debugLabel="example" />
      </>
    )
    await waitForElement(() => getByText("done"))
    await waitForElement(() => getByText("Fulfilled"))
    await waitForElement(() => getByText("example"))
  })

  test("shows rejected requests", async () => {
    const promiseFn = () => Promise.reject("oops")
    const { getByText } = render(
      <>
        <DevTools />
        <Async promiseFn={promiseFn} debugLabel="example" />
      </>
    )
    await waitForElement(() => getByText("oops"))
    await waitForElement(() => getByText("Rejected"))
    await waitForElement(() => getByText("example"))
  })

  test("allows toggling interception of requests", async () => {
    const promiseFn = () => Promise.resolve("done")
    const { getByText, getByLabelText, queryByText, rerender } = render(<DevTools />)
    fireEvent.click(getByLabelText("Pause new requests"))
    rerender(
      <>
        <DevTools />
        <Async promiseFn={promiseFn} debugLabel="example" />
      </>
    )
    await waitForElement(() => getByText("Pending"))
    expect(queryByText("Fulfilled")).not.toBeInTheDocument()
    fireEvent.click(getByText("run"))
    await waitForElement(() => getByText("Fulfilled"))
  })

  test("allows changing the latency", async () => {
    const { getByRole, getByText } = render(<DevTools />)
    await waitForElement(() => getByText("Latency:"))
    await waitForElement(() => getByText("0 seconds"))
    fireEvent.change(getByRole("slider"), { target: { value: 2 } })
    await waitForElement(() => getByText("2 seconds"))
  })
})
