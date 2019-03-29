import { useCallback, useDebugValue, useEffect, useMemo, useRef, useReducer } from "react"
import { actionTypes, init, reducer } from "./reducer"

const noop = () => {}

const useAsync = (arg1, arg2) => {
  const counter = useRef(0)
  const isMounted = useRef(true)
  const lastArgs = useRef(undefined)
  const prevOptions = useRef(undefined)
  const abortController = useRef({ abort: noop })

  const options = typeof arg1 === "function" ? { ...arg2, promiseFn: arg1 } : arg1
  const { promise, promiseFn, deferFn, initialValue, onResolve, onReject, watch, watchFn } = options

  const [state, dispatch] = useReducer(reducer, options, init)

  const setData = (data, callback = noop) => {
    if (isMounted.current) {
      dispatch({ type: actionTypes.fulfill, payload: data })
      callback()
    }
    return data
  }

  const setError = (error, callback = noop) => {
    if (isMounted.current) {
      dispatch({ type: actionTypes.reject, payload: error, error: true })
      callback()
    }
    return error
  }

  const handleResolve = count => data =>
    count === counter.current && setData(data, () => onResolve && onResolve(data))
  const handleReject = count => error =>
    count === counter.current && setError(error, () => onReject && onReject(error))

  const start = () => {
    if ("AbortController" in window) {
      abortController.current.abort()
      abortController.current = new window.AbortController()
    }
    counter.current++
    isMounted.current && dispatch({ type: actionTypes.start, meta: { counter: counter.current } })
  }

  const load = () => {
    if (promise) {
      start()
      return promise.then(handleResolve(counter.current), handleReject(counter.current))
    }

    const isPreInitialized = initialValue && counter.current === 0
    if (promiseFn && !isPreInitialized) {
      start()
      return promiseFn(options, abortController.current).then(
        handleResolve(counter.current),
        handleReject(counter.current)
      )
    }
  }

  const run = (...args) => {
    if (deferFn) {
      lastArgs.current = args
      start()
      return deferFn(args, options, abortController.current).then(
        handleResolve(counter.current),
        handleReject(counter.current)
      )
    }
  }

  const cancel = () => {
    counter.current++
    abortController.current.abort()
    isMounted.current && dispatch({ type: actionTypes.cancel, meta: { counter: counter.current } })
  }

  useEffect(() => {
    if (watchFn && prevOptions.current && watchFn(options, prevOptions.current)) load()
  })
  useEffect(() => {
    promise || promiseFn ? load() : cancel()
  }, [promise, promiseFn, watch])
  useEffect(() => () => (isMounted.current = false), [])
  useEffect(() => () => abortController.current.abort(), [])
  useEffect(() => (prevOptions.current = options) && undefined)

  useDebugValue(state, ({ status }) => `[${counter.current}] ${status}`)

  return useMemo(
    () => ({
      ...state,
      cancel,
      run,
      reload: () => (lastArgs.current ? run(...lastArgs.current) : load()),
      setData,
      setError,
    }),
    [state]
  )
}

const parseResponse = (accept, json) => res => {
  if (!res.ok) return Promise.reject(res)
  if (json === false) return res
  if (json === true || accept === "application/json") return res.json()
  return res
}

const useAsyncFetch = (input, init, { defer, json, ...options } = {}) => {
  const method = input.method || (init && init.method)
  const headers = input.headers || (init && init.headers) || {}
  const accept = headers["Accept"] || headers["accept"] || (headers.get && headers.get("accept"))
  const doFetch = (input, init) => window.fetch(input, init).then(parseResponse(accept, json))
  const isDefer = defer === true || ~["POST", "PUT", "PATCH", "DELETE"].indexOf(method)
  const fn = defer === false || !isDefer ? "promiseFn" : "deferFn"
  const state = useAsync({
    ...options,
    [fn]: useCallback(
      (_, props, ctrl) => doFetch(input, { signal: ctrl ? ctrl.signal : props.signal, ...init }),
      [JSON.stringify(input), JSON.stringify(init)]
    ),
  })
  useDebugValue(state, ({ counter, status }) => `[${counter}] ${status}`)
  return state
}

const unsupported = () => {
  throw new Error(
    "useAsync requires React v16.8 or up. Upgrade your React version or use the <Async> component instead."
  )
}

export default (useEffect ? useAsync : unsupported)
export const useFetch = useEffect ? useAsyncFetch : unsupported
