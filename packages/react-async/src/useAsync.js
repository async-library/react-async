import { useCallback, useDebugValue, useEffect, useMemo, useRef, useReducer } from "react"

import globalScope from "./globalScope"
import {
  neverSettle,
  actionTypes,
  init,
  dispatchMiddleware,
  reducer as asyncReducer,
} from "./reducer"

const noop = () => {}

const useAsync = (arg1, arg2) => {
  const options = typeof arg1 === "function" ? { ...arg2, promiseFn: arg1 } : arg1

  const counter = useRef(0)
  const isMounted = useRef(true)
  const lastArgs = useRef(undefined)
  const lastOptions = useRef(undefined)
  const lastPromise = useRef(neverSettle)
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
    const isPreInitialized = initialValue && counter.current === 0
    if (promise) {
      start(() => promise)
        .then(handleResolve(counter.current))
        .catch(handleReject(counter.current))
    } else if (promiseFn && !isPreInitialized) {
      start(() => promiseFn(lastOptions.current, abortController.current))
        .then(handleResolve(counter.current))
        .catch(handleReject(counter.current))
    }
  }, [start, promise, promiseFn, initialValue, handleResolve, handleReject])

  const { deferFn } = options
  const run = useCallback(
    (...args) => {
      if (deferFn) {
        lastArgs.current = args
        start(() => deferFn(args, lastOptions.current, abortController.current))
          .then(handleResolve(counter.current))
          .catch(handleReject(counter.current))
      }
    },
    [start, deferFn, handleResolve, handleReject]
  )

  const reload = useCallback(() => {
    lastArgs.current ? run(...lastArgs.current) : load()
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
    if (watchFn && lastOptions.current && watchFn(options, lastOptions.current)) {
      lastOptions.current = options
      load()
    }
  })
  useEffect(() => {
    lastOptions.current = options
  }, [options])
  useEffect(() => {
    if (counter.current) cancel()
    if (promise || promiseFn) load()
  }, [promise, promiseFn, watch])
  useEffect(() => () => (isMounted.current = false), [])
  useEffect(() => () => cancel(), [])
  /* eslint-enable react-hooks/exhaustive-deps */

  useDebugValue(state, ({ status }) => `[${counter.current}] ${status}`)

  if (options.suspense && state.isPending && lastPromise.current !== neverSettle) {
    // Rely on Suspense to handle the loading state
    throw lastPromise.current
  }

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

export class FetchError extends Error {
  constructor(response) {
    super(`${response.status} ${response.statusText}`)
    /* istanbul ignore next */
    if (Object.setPrototypeOf) {
      // Not available in IE 10, but can be polyfilled
      Object.setPrototypeOf(this, FetchError.prototype)
    }
    this.response = response
  }
}

const parseResponse = (accept, json) => res => {
  if (!res.ok) return Promise.reject(new FetchError(res))
  if (typeof json === "boolean") return json ? res.json() : res
  return accept === "application/json" ? res.json() : res
}

const useAsyncFetch = (resource, init, { defer, json, ...options } = {}) => {
  const method = resource.method || (init && init.method)
  const headers = resource.headers || (init && init.headers) || {}
  const accept = headers["Accept"] || headers["accept"] || (headers.get && headers.get("accept"))
  const doFetch = (resource, init) =>
    globalScope.fetch(resource, init).then(parseResponse(accept, json))
  const isDefer =
    typeof defer === "boolean" ? defer : ["POST", "PUT", "PATCH", "DELETE"].indexOf(method) !== -1
  const fn = isDefer ? "deferFn" : "promiseFn"
  const identity = JSON.stringify({ resource, init, isDefer })
  const state = useAsync({
    ...options,
    [fn]: useCallback(
      (arg1, arg2, arg3) => {
        const [override, signal] = isDefer ? [arg1[0], arg3.signal] : [undefined, arg2.signal]
        const isEvent = typeof override === "object" && "preventDefault" in override
        if (!override || isEvent) {
          return doFetch(resource, { signal, ...init })
        }
        if (typeof override === "function") {
          const { resource: runResource, ...runInit } = override({ resource, signal, ...init })
          return doFetch(runResource || resource, { signal, ...runInit })
        }
        const { resource: runResource, ...runInit } = override
        return doFetch(runResource || resource, { signal, ...init, ...runInit })
      },
      [identity] // eslint-disable-line react-hooks/exhaustive-deps
    ),
  })
  useDebugValue(state, ({ counter, status }) => `[${counter}] ${status}`)
  return state
}

/* istanbul ignore next */
const unsupported = () => {
  throw new Error(
    "useAsync requires React v16.8 or up. Upgrade your React version or use the <Async> component instead."
  )
}

export default useEffect ? useAsync : unsupported
export const useFetch = useEffect ? useAsyncFetch : unsupported
