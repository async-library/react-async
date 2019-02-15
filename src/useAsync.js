import { useState, useEffect, useMemo, useCallback, useRef } from "react"

const useAsync = (arg1, arg2) => {
  const counter = useRef(0)
  const isMounted = useRef(true)
  const lastArgs = useRef(undefined)
  const prevOptions = useRef(undefined)
  const abortController = useRef({ abort: () => {} })

  const options = typeof arg1 === "function" ? { ...arg2, promiseFn: arg1 } : arg1
  const { promiseFn, deferFn, initialValue, onResolve, onReject, watch, watchFn } = options

  const [state, setState] = useState({
    data: initialValue instanceof Error ? undefined : initialValue,
    error: initialValue instanceof Error ? initialValue : undefined,
    startedAt: promiseFn ? new Date() : undefined,
    finishedAt: initialValue ? new Date() : undefined,
  })

  const handleData = (data, callback = () => {}) => {
    if (isMounted.current) {
      setState(state => ({ ...state, data, error: undefined, finishedAt: new Date() }))
      callback(data)
    }
    return data
  }

  const handleError = (error, callback = () => {}) => {
    if (isMounted.current) {
      setState(state => ({ ...state, error, finishedAt: new Date() }))
      callback(error)
    }
    return error
  }

  const handleResolve = count => data => count === counter.current && handleData(data, onResolve)
  const handleReject = count => error => count === counter.current && handleError(error, onReject)

  const start = () => {
    if ("AbortController" in window) {
      abortController.current.abort()
      abortController.current = new window.AbortController()
    }
    counter.current++
    setState(state => ({
      ...state,
      startedAt: new Date(),
      finishedAt: undefined,
    }))
  }

  const load = () => {
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
    setState(state => ({ ...state, startedAt: undefined }))
  }

  useEffect(() => {
    if (watchFn && prevOptions.current && watchFn(options, prevOptions.current)) load()
  })
  useEffect(() => (promiseFn ? load() && undefined : cancel()), [promiseFn, watch])
  useEffect(() => () => (isMounted.current = false), [])
  useEffect(() => () => abortController.current.abort(), [])
  useEffect(() => (prevOptions.current = options) && undefined)

  useDebugValue(state, ({ startedAt, finishedAt, error }) => {
    if (startedAt && (!finishedAt || finishedAt < startedAt)) return `[${counter.current}] Loading`
    if (finishedAt) return error ? `[${counter.current}] Rejected` : `[${counter.current}] Resolved`
    return `[${counter.current}] Pending`
  })

  return useMemo(
    () => ({
      ...state,
      isLoading: state.startedAt && (!state.finishedAt || state.finishedAt < state.startedAt),
      initialValue,
      run,
      reload: () => (lastArgs.current ? run(...lastArgs.current) : load()),
      cancel,
      setData: handleData,
      setError: handleError,
    }),
    [state]
  )
}

const parseResponse = accept => res => {
  if (!res.ok) return Promise.reject(res)
  if (accept === "application/json") return res.json()
  return res
}

const useAsyncFetch = (input, init, options) => {
  const method = input.method || (init && init.method)
  const headers = input.headers || (init && init.headers) || {}
  const accept = headers["Accept"] || headers["accept"] || (headers.get && headers.get("accept"))
  const doFetch = (input, init) => window.fetch(input, init).then(parseResponse(accept))
  const fn = ~["POST", "PUT", "PATCH", "DELETE"].indexOf(method) ? "deferFn" : "promiseFn"
  return useAsync({
    ...options,
    [fn]: useCallback(
      (_, props, ctrl) => doFetch(input, { signal: ctrl ? ctrl.signal : props.signal, ...init }),
      [JSON.stringify(input), JSON.stringify(init)]
    ),
  })
}

const unsupported = () => {
  throw new Error(
    "useAsync requires React v16.8 or up. Upgrade your React version or use the <Async> component instead."
  )
}

export default (useState ? useAsync : unsupported)
export const useFetch = useState ? useAsyncFetch : unsupported
