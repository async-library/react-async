import React, { useCallback, useDebugValue, useEffect, useMemo, useRef, useReducer } from "react"

import globalScope from "./globalScope"
import { ActionTypes, init, dispatchMiddleware, reducer as asyncReducer } from "./reducer"

import {
  AsyncOptions,
  AsyncState,
  AbstractState,
  PromiseFn,
  Meta,
  AsyncInitial,
  AsyncFulfilled,
  AsyncPending,
  AsyncRejected,
} from "./types"

/**
 * Due to https://github.com/microsoft/web-build-tools/issues/1050, we need
 * AbstractState imported in this file, even though it is only used implicitly.
 * This _uses_ AbstractState so it is not accidentally removed by someone.
 */
declare type ImportWorkaround<T> =
  | AbstractState<T>
  | AsyncInitial<T>
  | AsyncFulfilled<T>
  | AsyncPending<T>
  | AsyncRejected<T>

export interface FetchOptions<T> extends AsyncOptions<T> {
  defer?: boolean
  json?: boolean
}

const noop = () => {}
class MockAbortController implements AbortController {
  public abort = noop
  readonly signal = {} as AbortSignal
}

function useAsync<T extends {}>(options: AsyncOptions<T>): AsyncState<T>
function useAsync<T extends {}>(promiseFn: PromiseFn<T>, options?: AsyncOptions<T>): AsyncState<T>

function useAsync<T extends {}>(
  arg1: AsyncOptions<T> | PromiseFn<T>,
  arg2?: AsyncOptions<T>
): AsyncState<T> {
  const options: AsyncOptions<T> =
    typeof arg1 === "function"
      ? {
          ...arg2,
          promiseFn: arg1,
        }
      : arg1

  const counter = useRef(0)
  const isMounted = useRef(true)
  const lastArgs = useRef<any[] | undefined>(undefined)
  const lastOptions = useRef<AsyncOptions<T> | undefined>(undefined)
  const lastPromise = useRef<Promise<T> | undefined>(undefined)
  const abortController = useRef<AbortController>(new MockAbortController())

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
  const getMeta: <M extends Meta = Meta>(meta?: M) => M = useCallback(
    (meta?) =>
      ({
        counter: counter.current,
        promise: lastPromise.current,
        debugLabel,
        ...meta,
      } as any),
    [debugLabel]
  )

  const setData = useCallback(
    (data, callback = noop) => {
      if (isMounted.current) {
        dispatch({
          type: ActionTypes.fulfill,
          payload: data,
          meta: getMeta(),
        })
        callback()
      }
      return data
    },
    [dispatch, getMeta]
  )

  const setError = useCallback(
    (error, callback = noop) => {
      if (isMounted.current) {
        dispatch({
          type: ActionTypes.reject,
          payload: error,
          error: true,
          meta: getMeta(),
        })
        callback()
      }
      return error
    },
    [dispatch, getMeta]
  )

  const { onResolve, onReject } = options
  const handleResolve = useCallback(
    count => (data: T) =>
      count === counter.current && setData(data, () => onResolve && onResolve(data)),
    [setData, onResolve]
  )
  const handleReject = useCallback(
    count => (err: Error) =>
      count === counter.current && setError(err, () => onReject && onReject(err)),
    [setError, onReject]
  )

  const start = useCallback(
    promiseFn => {
      if ("AbortController" in globalScope) {
        abortController.current.abort()
        abortController.current = new globalScope.AbortController!()
      }
      counter.current++
      return (lastPromise.current = new Promise((resolve, reject) => {
        if (!isMounted.current) return
        const executor = () => promiseFn().then(resolve, reject)
        dispatch({
          type: ActionTypes.start,
          payload: executor,
          meta: getMeta(),
        })
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
      start(() => promiseFn(lastOptions.current!, abortController.current))
        .then(handleResolve(counter.current))
        .catch(handleReject(counter.current))
    }
  }, [start, promise, promiseFn, initialValue, handleResolve, handleReject])

  const { deferFn } = options
  const run = useCallback(
    (...args) => {
      if (deferFn) {
        lastArgs.current = args
        start(() => deferFn(args, lastOptions.current!, abortController.current))
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
    isMounted.current &&
      dispatch({
        type: ActionTypes.cancel,
        meta: getMeta(),
      })
  }, [onCancel, dispatch, getMeta])

  /* These effects should only be triggered on changes to specific props */
  /* eslint-disable react-hooks/exhaustive-deps */
  const { watch, watchFn } = options
  useEffect(() => {
    if (watchFn && lastOptions.current && watchFn(options, lastOptions.current)) load()
  })
  useEffect(() => {
    lastOptions.current = options
  }, [options])
  useEffect(() => {
    if (counter.current) cancel()
    if (promise || promiseFn) load()
  }, [promise, promiseFn, watch])
  useEffect(
    () => () => {
      isMounted.current = false
    },
    []
  )
  useEffect(() => () => cancel(), [])
  /* eslint-enable react-hooks/exhaustive-deps */

  useDebugValue(state, ({ status }) => `[${counter.current}] ${status}`)

  return useMemo(
    () =>
      ({
        ...state,
        run,
        reload,
        cancel,
        setData,
        setError,
      } as AsyncState<T>),
    [state, run, reload, cancel, setData, setError]
  )
}

export class FetchError extends Error {
  public response: Response
  constructor(response: Response) {
    super(`${response.status} ${response.statusText}`)
    this.response = response
  }
}

const parseResponse = (accept: undefined | string, json: undefined | boolean) => (
  res: Response
) => {
  if (!res.ok) return Promise.reject(new FetchError(res))
  if (typeof json === "boolean") return json ? res.json() : res
  return accept === "application/json" ? res.json() : res
}

interface FetchRun<T> extends Omit<AbstractState<T>, "run"> {
  run(overrideInit: (init: RequestInit) => RequestInit): void
  run(overrideInit: Partial<RequestInit>): void
  run(ignoredEvent: React.SyntheticEvent): void
  run(ignoredEvent: Event): void
  run(): void
}

/**
 *
 * @param {RequestInfo} input
 * @param {RequestInit} init
 * @param {FetchOptions} options
 * @returns {AsyncState<T, FetchRun<T>>}
 */
const useAsyncFetch = <T extends {}>(
  input: RequestInfo,
  init: RequestInit,
  { defer, json, ...options }: FetchOptions<T> = {}
): AsyncState<T, FetchRun<T>> => {
  const method = (input as Request).method || (init && init.method)
  const headers: Headers & Record<string, any> =
    (input as Request).headers || (init && init.headers) || {}
  const accept: string | undefined =
    headers["Accept"] || headers["accept"] || (headers.get && headers.get("accept"))
  const doFetch = (input: RequestInfo, init: RequestInit) =>
    globalScope.fetch(input, init).then(parseResponse(accept, json))
  const isDefer =
    typeof defer === "boolean" ? defer : ["POST", "PUT", "PATCH", "DELETE"].indexOf(method!) !== -1
  const fn = isDefer ? "deferFn" : "promiseFn"
  const identity = JSON.stringify({
    input,
    init,
    isDefer,
  })
  const state = useAsync({
    ...options,
    [fn]: useCallback(
      // TODO
      (arg1: any, arg2: any, arg3: any) => {
        const [override, signal] = arg3 ? [arg1[0], arg3.signal] : [undefined, arg2.signal]
        if (typeof override === "object" && "preventDefault" in override) {
          // Don't spread Events or SyntheticEvents
          return doFetch(input, {
            signal,
            ...init,
          })
        }
        return typeof override === "function"
          ? doFetch(input, {
              signal,
              ...override(init),
            })
          : doFetch(input, {
              signal,
              ...init,
              ...override,
            })
      },
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

export default useEffect ? useAsync : unsupported
export const useFetch = useEffect ? useAsyncFetch : unsupported
