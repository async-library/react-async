import { getInitialStatus, getIdleStatus, getStatusProps, statusTypes } from "./status"

export const actionTypes = {
  start: "start",
  cancel: "cancel",
  fulfill: "fulfill",
  reject: "reject",
  reinitialize: "reinitialize",
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
      }
    case actionTypes.cancel:
      return {
        ...state,
        startedAt: undefined,
        finishedAt: undefined,
        ...getStatusProps(getIdleStatus(state.error || state.data)),
        counter: meta.counter,
      }
    case actionTypes.fulfill:
      return {
        ...state,
        data: payload,
        value: payload,
        error: undefined,
        finishedAt: new Date(),
        ...getStatusProps(statusTypes.fulfilled),
      }
    case actionTypes.reject:
      return {
        ...state,
        error: payload,
        value: payload,
        finishedAt: new Date(),
        ...getStatusProps(statusTypes.rejected),
      }
    case actionTypes.reinitialize:
      const newState = init(payload)
      if (payload.initialValue) newState.finishedAt = state.finishedAt
      if (payload.promise) newState.startedAt = state.startedAt
      return newState
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
