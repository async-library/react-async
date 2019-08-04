/* eslint-disable react/prop-types */

import "jest-dom/extend-expect"

import { getInitialStatus, getIdleStatus, statusTypes } from "./status"

describe("getInitialStatus", () => {
  test("returns 'initial' when given an undefined value", () => {
    expect(getInitialStatus(undefined, false, undefined)).toEqual(statusTypes.initial)
  })
  test("returns 'initial' when requested to skip on mount", () => {
    expect(getInitialStatus("initial", true, () => Promise.resolve("foo"))).toEqual(
      statusTypes.initial
    )
  })
  test("returns 'pending' when requested to skip on mount but given a promise", () => {
    expect(getInitialStatus("initial", true, Promise.resolve("foo"))).toEqual(statusTypes.pending)
  })
  test("returns 'pending' when given only a promise", () => {
    expect(getInitialStatus(undefined, false, Promise.resolve("foo"))).toEqual(statusTypes.pending)
  })
  test("returns 'rejected' when given an Error value", () => {
    expect(getInitialStatus(new Error("oops"))).toEqual(statusTypes.rejected)
  })
  test("returns 'fulfilled' when given any other value", () => {
    expect(getInitialStatus(null, false)).toEqual(statusTypes.fulfilled)
  })
})

describe("getIdleStatus", () => {
  test("returns 'initial' when given an undefined value", () => {
    expect(getIdleStatus(undefined)).toEqual(statusTypes.initial)
  })
  test("returns 'rejected' when given an Error value", () => {
    expect(getIdleStatus(new Error("oops"))).toEqual(statusTypes.rejected)
  })
  test("returns 'fulfilled' when given any other value", () => {
    expect(getIdleStatus(null)).toEqual(statusTypes.fulfilled)
  })
})
