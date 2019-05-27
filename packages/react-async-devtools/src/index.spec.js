import "jest-dom/extend-expect"
import React from "react"
import { render, cleanup, waitForElement } from "react-testing-library"
import DevTools from "./index"

afterEach(cleanup)

describe("DevTools", () => {
  test("renders the current latency", async () => {
    const { getByText } = render(<DevTools />)
    await waitForElement(() => getByText("Latency:"))
  })
})
