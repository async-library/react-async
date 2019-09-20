import { getInitialStatus, getIdleStatus, getStatusProps, statusTypes } from "./status"
import {
  PromiseFn,
  AsyncState,
  AsyncAction,
  AsyncPending,
  AsyncFulfilled,
  AsyncRejected,
  AsyncInitial,
  AbstractState,
  ReducerAsyncState,
  ReducerBaseState,
} from "./types"

/**
 * Due to https://github.com/microsoft/web-build-tools/issues/1050, we need
 * AbstractState imported in this file, even though it is only used implicitly.
 * This _uses_ AbstractState so it is not accidentally removed by someone.
 */
declare type ImportWorkaround<T> = AbstractState<T>

export enum actionTypes {
  start = "start",
  cancel = "cancel",
  fulfill = "fulfill",
  reject = "reject",
}

export const init = <T>({
  initialValue,
  promise,
  promiseFn,
}: {
  initialValue?: Error | T
  promise?: Promise<T>
  promiseFn?: PromiseFn<T>
}) =>
  ({
    initialValue,
    data: initialValue instanceof Error ? undefined : initialValue,
    error: initialValue instanceof Error ? initialValue : undefined,
    value: initialValue,
    startedAt: promise || promiseFn ? new Date() : undefined,
    finishedAt: initialValue ? new Date() : undefined,
    ...getStatusProps(getInitialStatus(initialValue, promise || promiseFn)),
    counter: 0,
    promise: undefined,
  } as ReducerAsyncState<T>)

export const reducer = <T>(state: ReducerAsyncState<T>, action: AsyncAction<T>) => {
  switch (action.type) {
    case actionTypes.start:
      return {
        ...state,
        startedAt: new Date(),
        finishedAt: undefined,
        ...getStatusProps(statusTypes.pending),
        counter: action.meta.counter,
        promise: action.meta.promise,
      } as AsyncPending<T, ReducerBaseState<T>>
    case actionTypes.cancel:
      return {
        ...state,
        startedAt: undefined,
        finishedAt: undefined,
        ...getStatusProps(getIdleStatus(state.error || state.data)),
        counter: action.meta.counter,
        promise: action.meta.promise,
      } as
        | AsyncInitial<T, ReducerBaseState<T>>
        | AsyncFulfilled<T, ReducerBaseState<T>>
        | AsyncRejected<T, ReducerBaseState<T>>
    case actionTypes.fulfill:
      return {
        ...state,
        data: action.payload,
        value: action.payload,
        error: undefined,
        finishedAt: new Date(),
        ...getStatusProps(statusTypes.fulfilled),
        promise: action.meta.promise,
      } as AsyncFulfilled<T, ReducerBaseState<T>>
    case actionTypes.reject:
      return {
        ...state,
        error: action.payload,
        value: action.payload,
        finishedAt: new Date(),
        ...getStatusProps(statusTypes.rejected),
        promise: action.meta.promise,
      } as AsyncRejected<T, ReducerBaseState<T>>
    default:
      return state
  }
}

export const dispatchMiddleware = <T>(
  dispatch: (action: AsyncAction<T>, ...args: any[]) => void
) => (action: AsyncAction<T>, ...args: unknown[]) => {
  dispatch(action, ...args)
  if (action.type === actionTypes.start && typeof action.payload === "function") {
    action.payload()
  }
}
