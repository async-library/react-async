import { useState, useEffect, useMemo, useRef } from "react"

const useAsync = (opts, init) => {
  const counter = useRef(0)
  const isMounted = useRef(true)
  const lastArgs = useRef(undefined)

  const options = typeof opts === "function" ? { promiseFn: opts, initialValue: init } : opts
  const { promiseFn, deferFn, initialValue, onResolve, onReject, watch } = options

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
      promiseFn(options).then(handleResolve(counter.current), handleReject(counter.current))
    }
  }

  const run = (...args) => {
    if (deferFn) {
      start()
      lastArgs.current = args
      return deferFn(...args, options).then(handleResolve(counter.current), handleReject(counter.current))
    }
  }

  useEffect(load, [promiseFn, watch])
  useEffect(() => () => (isMounted.current = false), [])

  return useMemo(
    () => ({
      ...state,
      isLoading: state.startedAt && (!state.finishedAt || state.finishedAt < state.startedAt),
      initialValue,
      run,
      reload: () => (lastArgs.current ? run(...lastArgs.current) : load()),
      cancel: () => {
        counter.current++
        setState(state => ({ ...state, startedAt: undefined }))
      },
      setData: handleData,
      setError: handleError,
    }),
    [state]
  )
}

const unsupported = () => {
  throw new Error(
    "useAsync requires react@16.7.0-alpha. Upgrade your React version or use the <Async> component instead."
  )
}

export default (useState ? useAsync : unsupported)
