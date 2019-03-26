import { getInitialStatus, getIdleStatus, getStatusProps, statusTypes } from "./status"

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
  startedAt: promise || promiseFn ? new Date() : undefined,
  finishedAt: initialValue ? new Date() : undefined,
  ...getStatusProps(getInitialStatus(initialValue, promise || promiseFn)),
  counter: 0,
})

export const reducer = (state, { type, payload, meta }) => {
  switch (type) {
    case actionTypes.start:
      return {
        ...state,
        startedAt: new Date(),
        finishedAt: undefined,
        ...getStatusProps(statusTypes.loading),
        counter: meta.counter,
      }
    case actionTypes.cancel:
      return {
        ...state,
        startedAt: undefined,
        ...getStatusProps(getIdleStatus(state.error || state.data)),
        counter: meta.counter,
      }
    case actionTypes.fulfill:
      return {
        ...state,
        data: payload,
        error: undefined,
        finishedAt: new Date(),
        ...getStatusProps(statusTypes.fulfilled),
      }
    case actionTypes.reject:
      return {
        ...state,
        error: payload,
        finishedAt: new Date(),
        ...getStatusProps(statusTypes.rejected),
      }
  }
}
