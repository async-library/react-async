import { useCallback, useDebugValue, useEffect, useMemo, useRef, useReducer } from "react"

import globalScope from "./globalScope"
import { actionTypes, init, dispatchMiddleware, reducer as asyncReducer } from "./reducer"

const noop = () => {}

const useAsync = (arg1, arg2) => {
  const options = typeof arg1 === "function" ? { ...arg2, promiseFn: arg1 } : arg1

  const counter = useRef(0)
  const isMounted = useRef(true)
  const lastArgs = useRef(undefined)
  const lastOptions = useRef(undefined)
  const lastPromise = useRef(undefined)
  const abortController = useRef({ abort: noop })

  const { devToolsDispatcher } = globalScope.__REACT_ASYNC__
  const { reducer, dispatcher = devToolsDispatcher } = options
  const [state, _dispatch] = useReducer(
    reducer ? (state, action) => reducer(state, action, asyncReducer) : asyncReducer,
    options,
    init
  )
  const dispatch = useCallback(
    dispatcher
      ? action => dispatcher(action, dispatchMiddleware(_dispatch), lastOptions.current)
      : dispatchMiddleware(_dispatch),
    [dispatcher]
  )

  const { debugLabel } = options
  const getMeta = useCallback(
    meta => ({ counter: counter.current, promise: lastPromise.current, debugLabel, ...meta }),
    [debugLabel]
  )

  const setData = useCallback(
    (data, callback = noop) => {
      if (isMounted.current) {
        dispatch({ type: actionTypes.fulfill, payload: data, meta: getMeta() })
        callback()
      }
      return data
    },
    [dispatch, getMeta]
  )

  const setError = useCallback(
    (error, callback = noop) => {
      if (isMounted.current) {
        dispatch({ type: actionTypes.reject, payload: error, error: true, meta: getMeta() })
        callback()
      }
      return error
    },
    [dispatch, getMeta]
  )

  const { onResolve, onReject } = options
  const handleResolve = useCallback(
    count => data => count === counter.current && setData(data, () => onResolve && onResolve(data)),
    [setData, onResolve]
  )
  const handleReject = useCallback(
    count => err => count === counter.current && setError(err, () => onReject && onReject(err)),
    [setError, onReject]
  )

  const start = useCallback(
    promiseFn => {
      if ("AbortController" in globalScope) {
        abortController.current.abort()
        abortController.current = new globalScope.AbortController()
      }
      counter.current++
      return (lastPromise.current = new Promise((resolve, reject) => {
        if (!isMounted.current) return
        const executor = () => promiseFn().then(resolve, reject)
        dispatch({ type: actionTypes.start, payload: executor, meta: getMeta() })
      }))
    },
    [dispatch, getMeta]
  )

  const { promise, promiseFn, initialValue } = options
  const load = useCallback(() => {
    if (promise) {
      return start(() => promise).then(
        handleResolve(counter.current),
        handleReject(counter.current)
      )
    }
    const isPreInitialized = initialValue && counter.current === 0
    if (promiseFn && !isPreInitialized) {
      return start(() => promiseFn(lastOptions.current, abortController.current)).then(
        handleResolve(counter.current),
        handleReject(counter.current)
      )
    }
  }, [start, promise, promiseFn, initialValue, handleResolve, handleReject])

  const { deferFn } = options
  const run = useCallback(
    (...args) => {
      if (deferFn) {
        lastArgs.current = args
        return start(() => deferFn(args, lastOptions.current, abortController.current)).then(
          handleResolve(counter.current),
          handleReject(counter.current)
        )
      }
    },
    [start, deferFn, handleResolve, handleReject]
  )

  const reload = useCallback(() => {
    return lastArgs.current ? run(...lastArgs.current) : load()
  }, [run, load])

  const { onCancel } = options
  const cancel = useCallback(() => {
    onCancel && onCancel()
    counter.current++
    abortController.current.abort()
    isMounted.current && dispatch({ type: actionTypes.cancel, meta: getMeta() })
  }, [onCancel, dispatch, getMeta])

  /* These effects should only be triggered on changes to specific props */
  /* eslint-disable react-hooks/exhaustive-deps */
  const { watch, watchFn } = options
  useEffect(() => {
    if (watchFn && lastOptions.current && watchFn(options, lastOptions.current)) load()
  })
  useEffect(() => (lastOptions.current = options) && undefined)
  useEffect(() => {
    if (counter.current) cancel()
    if (promise || promiseFn) load()
  }, [promise, promiseFn, watch])
  useEffect(() => () => (isMounted.current = false), [])
  useEffect(() => () => cancel(), [])
  /* eslint-enable react-hooks/exhaustive-deps */

  useDebugValue(state, ({ status }) => `[${counter.current}] ${status}`)

  return useMemo(
    () => ({
      ...state,
      run,
      reload,
      cancel,
      setData,
      setError,
    }),
    [state, run, reload, cancel, setData, setError]
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
  const doFetch = (input, init) => globalScope.fetch(input, init).then(parseResponse(accept, json))
  const isDefer = defer === true || ~["POST", "PUT", "PATCH", "DELETE"].indexOf(method)
  const fn = defer === false || !isDefer ? "promiseFn" : "deferFn"
  const identity = JSON.stringify({ input, init })
  const state = useAsync({
    ...options,
    [fn]: useCallback(
      (_, props, ctrl) => doFetch(input, { signal: ctrl ? ctrl.signal : props.signal, ...init }),
      [identity] // eslint-disable-line react-hooks/exhaustive-deps
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
