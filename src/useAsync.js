import { useCallback, useDebugValue, useEffect, useMemo, useRef, useReducer } from "react"
import { actionTypes, init, dispatchMiddleware, reducer as asyncReducer } from "./reducer"

const noop = () => {}

const useAsync = (arg1, arg2) => {
  const options = typeof arg1 === "function" ? { ...arg2, promiseFn: arg1 } : arg1

  const counter = useRef(0)
  const isMounted = useRef(true)
  const lastArgs = useRef(undefined)
  const prevOptions = useRef(undefined)
  const abortController = useRef({ abort: noop })

  const { reducer, dispatcher } = options
  const [state, _dispatch] = useReducer(
    reducer ? (state, action) => reducer(state, action, asyncReducer) : asyncReducer,
    options,
    init
  )
  const dispatch = dispatcher
    ? action => dispatcher(action, dispatchMiddleware(_dispatch), options)
    : dispatchMiddleware(_dispatch)

  const getMeta = meta => ({ counter: counter.current, ...meta })

  const setData = (data, callback = noop) => {
    if (isMounted.current) {
      dispatch({ type: actionTypes.fulfill, payload: data, meta: getMeta() })
      callback()
    }
    return data
  }

  const setError = (error, callback = noop) => {
    if (isMounted.current) {
      dispatch({ type: actionTypes.reject, payload: error, error: true, meta: getMeta() })
      callback()
    }
    return error
  }

  const { onResolve, onReject } = options
  const handleResolve = count => data =>
    count === counter.current && setData(data, () => onResolve && onResolve(data))
  const handleReject = count => error =>
    count === counter.current &&
    Promise.reject(setError(error, () => onReject && onReject(error)))

  const start = promiseFn => {
    if ("AbortController" in window) {
      abortController.current.abort()
      abortController.current = new window.AbortController()
    }
    counter.current++
    return new Promise((resolve, reject) => {
      if (!isMounted.current) return
      const executor = () => promiseFn().then(resolve, reject)
      dispatch({ type: actionTypes.start, payload: executor, meta: getMeta() })
    })
  }

  const { promise, promiseFn, initialValue } = options
  const load = () => {
    if (promise) {
      return start(() => promise).then(
        handleResolve(counter.current),
        handleReject(counter.current)
      )
    }
    const isPreInitialized = initialValue && counter.current === 0
    if (promiseFn && !isPreInitialized) {
      return start(() => promiseFn(options, abortController.current)).then(
        handleResolve(counter.current),
        handleReject(counter.current)
      )
    }
  }

  const { deferFn } = options
  const run = (...args) => {
    if (deferFn) {
      lastArgs.current = args
      return start(() => deferFn(args, options, abortController.current)).then(
        handleResolve(counter.current),
        handleReject(counter.current)
      )
    }
  }

  const cancel = () => {
    counter.current++
    abortController.current.abort()
    isMounted.current && dispatch({ type: actionTypes.cancel, meta: getMeta() })
  }

  const { watch, watchFn } = options
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
    [state, deferFn, onResolve, onReject, dispatcher, reducer]
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
