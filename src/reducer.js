export const actions = {
  start: "start",
  cancel: "cancel",
  fulfill: "fulfill",
  reject: "reject",
}

export const init = ({ initialValue, promise, promiseFn }) => ({
  initialValue,
  data: initialValue instanceof Error ? undefined : initialValue,
  error: initialValue instanceof Error ? initialValue : undefined,
  isLoading: !!promise || (promiseFn && !initialValue),
  startedAt: promise || promiseFn ? new Date() : undefined,
  finishedAt: initialValue ? new Date() : undefined,
  counter: 0,
})

export const reducer = (state, { type, payload, meta }) => {
  switch (type) {
    case actions.start:
      return {
        ...state,
        isLoading: true,
        startedAt: new Date(),
        finishedAt: undefined,
        counter: meta.counter,
      }
    case actions.cancel:
      return {
        ...state,
        isLoading: false,
        startedAt: undefined,
        counter: meta.counter,
      }
    case actions.fulfill:
      return {
        ...state,
        data: payload,
        error: undefined,
        isLoading: false,
        finishedAt: new Date(),
      }
    case actions.reject:
      return {
        ...state,
        error: payload,
        isLoading: false,
        finishedAt: new Date(),
      }
  }
}
