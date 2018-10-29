import { useState, useEffect, useMemo } from "react"

const useAsync = (opts, init) => {
  let counter = 0
  let isMounted = false
  let lastArgs = undefined

  const options = typeof opts === "function" ? { promiseFn: opts, initialValue: init } : opts
  const { promiseFn, deferFn, initialValue, onResolve, onReject, watch } = options

  const [data, setData] = useState(initialValue instanceof Error ? undefined : initialValue)
  const [error, setError] = useState(initialValue instanceof Error ? initialValue : undefined)
  const [startedAt, setStartedAt] = useState(promiseFn ? new Date() : undefined)
  const [finishedAt, setFinishedAt] = useState(initialValue ? new Date() : undefined)

  const cancel = () => {
    counter++
    setStartedAt(undefined)
  }

  const start = () => {
    counter++
    setStartedAt(new Date())
    setFinishedAt(undefined)
  }

  const end = () => setFinishedAt(new Date())

  const handleData = (data, callback = () => {}) => {
    if (isMounted) {
      end()
      setData(data)
      setError(undefined)
      callback(data)
    }
    return data
  }

  const handleError = (error, callback = () => {}) => {
    if (isMounted) {
      end()
      setError(error)
      callback(error)
    }
    return error
  }

  const handleResolve = count => data => count === counter && handleData(data, onResolve)
  const handleReject = count => error => count === counter && handleError(error, onReject)

  const load = () => {
    if (promiseFn) {
      start()
      promiseFn(options).then(handleResolve(counter), handleReject(counter))
    }
  }

  const run = (...args) => {
    if (deferFn) {
      lastArgs = args
      start()
      return deferFn(...args, options).then(handleResolve(counter), handleReject(counter))
    }
  }

  const reload = () => (lastArgs ? run(...lastArgs) : load())

  useEffect(() => {
    isMounted = true
    return () => (isMounted = false)
  }, [])

  useEffect(load, [promiseFn, watch])

  return useMemo(
    () => ({
      isLoading: startedAt && (!finishedAt || finishedAt < startedAt),
      startedAt,
      finishedAt,
      data,
      error,
      initialValue,
      cancel,
      run,
      reload,
      setData: handleData,
      setError: handleError
    }),
    [data, error, startedAt, finishedAt]
  )
}

const unsupported = () => {
  throw new Error("useAsync requires react@16.7.0 or later")
}

export default (useState ? useAsync : unsupported)
