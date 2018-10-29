import { useState, useEffect, useMemo } from "react"

const useAsync = props => {
  let counter = 0
  let isMounted = false
  let lastArgs = undefined

  const initialError = props.initialValue instanceof Error ? props.initialValue : undefined
  const initialData = initialError ? undefined : props.initialValue
  const [data, setData] = useState(initialData)
  const [error, setError] = useState(initialError)
  const [startedAt, setStartedAt] = useState(props.promiseFn ? new Date() : undefined)
  const [finishedAt, setFinishedAt] = useState(props.initialValue ? new Date() : undefined)

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

  const onResolve = count => data => count === counter && handleData(data, props.onResolve)
  const onReject = count => error => count === counter && handleError(error, props.onReject)

  const load = () => {
    if (props.promiseFn) {
      start()
      props.promiseFn(props).then(onResolve(counter), onReject(counter))
    }
  }

  const run = (...args) => {
    if (props.deferFn) {
      lastArgs = args
      start()
      return props.deferFn(...args, props).then(onResolve(counter), onReject(counter))
    }
  }

  const reload = () => (lastArgs ? run(...lastArgs) : load())

  useEffect(() => {
    isMounted = true
    return () => (isMounted = false)
  }, [])

  useEffect(load, [props.promiseFn, props.watch])

  return useMemo(
    () => ({
      isLoading: startedAt && (!finishedAt || finishedAt < startedAt),
      startedAt,
      finishedAt,
      data,
      error,
      cancel,
      run,
      reload,
      setData: handleData,
      setError: handleError,
      initialValue: props.initialValue
    }),
    [data, error, startedAt, finishedAt]
  )
}

const unsupported = () => {
  throw new Error("useAsync requires react@16.7.0 or later")
}

export default (useState ? useAsync : unsupported)
