import globalScope from "./globalScope"

describe("globalScope", () => {
  test("returns the global object", () => {
    expect(globalScope).toBe(global)
  })

  test("defines __REACT_ASYNC__ object", () => {
    expect(typeof globalScope.__REACT_ASYNC__).toBe("object")
  })
})
