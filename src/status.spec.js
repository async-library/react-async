/* eslint-disable react/prop-types */

import "jest-dom/extend-expect"

import { getInitialStatus, getIdleStatus, statusTypes } from "./status"

describe("getInitialStatus", () => {
  test("returns 'pending' when given an undefined value", () => {
    expect(getInitialStatus(undefined)).toEqual(statusTypes.pending)
  })
  test("returns 'loading' when given only a promise", () => {
    expect(getInitialStatus(undefined, Promise.resolve("foo"))).toEqual(statusTypes.loading)
  })
  test("returns 'rejected' when given an Error value", () => {
    expect(getInitialStatus(new Error("oops"))).toEqual(statusTypes.rejected)
  })
  test("returns 'fulfilled' when given any other value", () => {
    expect(getInitialStatus(null)).toEqual(statusTypes.fulfilled)
  })
})

describe("getIdleStatus", () => {
  test("returns 'pending' when given an undefined value", () => {
    expect(getIdleStatus(undefined)).toEqual(statusTypes.pending)
  })
  test("returns 'rejected' when given an Error value", () => {
    expect(getIdleStatus(new Error("oops"))).toEqual(statusTypes.rejected)
  })
  test("returns 'fulfilled' when given any other value", () => {
    expect(getIdleStatus(null)).toEqual(statusTypes.fulfilled)
  })
})
