/* eslint-disable no-console */

/**
 * This is just a little hack to silence a warning that we'll get until react fixes this
 * @see https://github.com/facebook/react/pull/14853
 */

console.log("Loaded jest.setup.js")

const originalError = console.error

beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
