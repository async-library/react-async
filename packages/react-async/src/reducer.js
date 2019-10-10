import { getInitialStatus, getIdleStatus, getStatusProps, statusTypes } from "./status"

// This exists to make sure we don't hold any references to user-provided functions
function NeverSettle() {}
/* istanbul ignore next */
if (Object.setPrototypeOf) {
  // Not available in IE 10, but can be polyfilled
  Object.setPrototypeOf(NeverSettle, Promise)
}
NeverSettle.prototype = Object.assign(Object.create(Promise.prototype), {
  finally() {
    return this
  },
  catch() {
    return this
  },
  then() {
    return this
  },
})

export const neverSettle = new NeverSettle()

export const actionTypes = {
  start: "start",
  cancel: "cancel",
  fulfill: "fulfill",
  reject: "reject",
}

export const init = ({ initialValue, promise, promiseFn }) => ({
  initialValue,
  data: initialValue instanceof Error ? undefined : initialValue,
  error: initialValue instanceof Error ? initialValue : undefined,
  value: initialValue,
  startedAt: promise || promiseFn ? new Date() : undefined,
  finishedAt: initialValue ? new Date() : undefined,
  ...getStatusProps(getInitialStatus(initialValue, promise || promiseFn)),
  counter: 0,
  promise: neverSettle,
})

export const reducer = (state, { type, payload, meta }) => {
  switch (type) {
    case actionTypes.start:
      return {
        ...state,
        startedAt: new Date(),
        finishedAt: undefined,
        ...getStatusProps(statusTypes.pending),
        counter: meta.counter,
        promise: meta.promise,
      }
    case actionTypes.cancel:
      return {
        ...state,
        startedAt: undefined,
        finishedAt: undefined,
        ...getStatusProps(getIdleStatus(state.error || state.data)),
        counter: meta.counter,
        promise: meta.promise,
      }
    case actionTypes.fulfill:
      return {
        ...state,
        data: payload,
        value: payload,
        error: undefined,
        finishedAt: new Date(),
        ...getStatusProps(statusTypes.fulfilled),
        promise: meta.promise,
      }
    case actionTypes.reject:
      return {
        ...state,
        error: payload,
        value: payload,
        finishedAt: new Date(),
        ...getStatusProps(statusTypes.rejected),
        promise: meta.promise,
      }
    default:
      return state
  }
}

export const dispatchMiddleware = dispatch => (action, ...args) => {
  dispatch(action, ...args)
  if (action.type === actionTypes.start && typeof action.payload === "function") {
    action.payload()
  }
}
