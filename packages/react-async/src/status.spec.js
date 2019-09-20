/* eslint-disable react/prop-types */

import "@testing-library/jest-dom/extend-expect"

import { getInitialStatus, getIdleStatus, StatusTypes } from "./status"

describe("getInitialStatus", () => {
  test("returns 'initial' when given an undefined value", () => {
    expect(getInitialStatus(undefined)).toEqual(StatusTypes.initial)
  })
  test("returns 'pending' when given only a promise", () => {
    expect(getInitialStatus(undefined, Promise.resolve("foo"))).toEqual(StatusTypes.pending)
  })
  test("returns 'rejected' when given an Error value", () => {
    expect(getInitialStatus(new Error("oops"))).toEqual(StatusTypes.rejected)
  })
  test("returns 'fulfilled' when given any other value", () => {
    expect(getInitialStatus(null)).toEqual(StatusTypes.fulfilled)
  })
})

describe("getIdleStatus", () => {
  test("returns 'initial' when given an undefined value", () => {
    expect(getIdleStatus(undefined)).toEqual(StatusTypes.initial)
  })
  test("returns 'rejected' when given an Error value", () => {
    expect(getIdleStatus(new Error("oops"))).toEqual(StatusTypes.rejected)
  })
  test("returns 'fulfilled' when given any other value", () => {
    expect(getIdleStatus(null)).toEqual(StatusTypes.fulfilled)
  })
})
