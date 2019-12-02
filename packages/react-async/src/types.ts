import React from "react"

export type AsyncChildren<T> = ((state: AsyncState<T>) => React.ReactNode) | React.ReactNode
export type InitialChildren<T> = ((state: AsyncInitial<T>) => React.ReactNode) | React.ReactNode
export type PendingChildren<T> = ((state: AsyncPending<T>) => React.ReactNode) | React.ReactNode
export type FulfilledChildren<T> =
  | ((data: T, state: AsyncFulfilled<T>) => React.ReactNode)
  | React.ReactNode
export type RejectedChildren<T> =
  | ((error: Error, state: AsyncRejected<T>) => React.ReactNode)
  | React.ReactNode
export type SettledChildren<T> =
  | ((state: AsyncFulfilled<T> | AsyncRejected<T>) => React.ReactNode)
  | React.ReactNode

export type PromiseFn<T> = (props: AsyncProps<T>, controller: AbortController) => Promise<T>
export type DeferFn<T> = (
  args: any[],
  props: AsyncProps<T>,
  controller: AbortController
) => Promise<T>

export interface AbstractAction {
  type: string
  meta: { counter: number; [meta: string]: any }
}
export type Meta = AbstractAction["meta"]

export type Start = AbstractAction & { type: "start"; payload: () => Promise<void> }
export type Cancel = AbstractAction & { type: "cancel" }
export type Fulfill<T> = AbstractAction & { type: "fulfill"; payload: T }
export type Reject = AbstractAction & { type: "reject"; payload: Error; error: true }
export type AsyncAction<T> = Start | Cancel | Fulfill<T> | Reject

export interface AsyncOptions<T> {
  promise?: Promise<T>
  promiseFn?: PromiseFn<T>
  deferFn?: DeferFn<T>
  watch?: any
  watchFn?: (props: AsyncProps<T>, prevProps: AsyncProps<T>) => any
  initialValue?: T
  onResolve?: (data: T) => void
  onReject?: (error: Error) => void
  reducer?: (
    state: ReducerAsyncState<T>,
    action: AsyncAction<T>,
    internalReducer: (state: ReducerAsyncState<T>, action: AsyncAction<T>) => ReducerAsyncState<T>
  ) => AsyncState<T>
  dispatcher?: (
    action: AsyncAction<T>,
    internalDispatch: (action: AsyncAction<T>) => void,
    props: AsyncProps<T>
  ) => void
  debugLabel?: string
  [prop: string]: any
}

export interface AsyncProps<T> extends AsyncOptions<T> {
  children?: AsyncChildren<T>
}

export interface AbstractState<T> {
  initialValue?: T | Error
  counter: number
  promise: Promise<T>
  run: (...args: any[]) => void
  reload: () => void
  cancel: () => void
  setData: (data: T, callback?: () => void) => T
  setError: (error: Error, callback?: () => void) => Error
}

export type AsyncInitial<T, S = AbstractState<T>> = S & {
  initialValue?: undefined
  data: undefined
  error: undefined
  value: undefined
  startedAt: undefined
  finishedAt: undefined
  status: "initial"
  isInitial: false
  isPending: false
  isLoading: false
  isFulfilled: false
  isResolved: false
  isRejected: false
  isSettled: false
}
export type AsyncPending<T, S = AbstractState<T>> = S & {
  data: T | undefined
  error: Error | undefined
  value: T | Error | undefined
  startedAt: Date
  finishedAt: undefined
  status: "pending"
  isInitial: false
  isPending: true
  isLoading: true
  isFulfilled: false
  isResolved: false
  isRejected: false
  isSettled: false
}
export type AsyncFulfilled<T, S = AbstractState<T>> = S & {
  data: T
  error: undefined
  value: T
  startedAt: Date
  finishedAt: Date
  status: "fulfilled"
  isInitial: false
  isPending: false
  isLoading: false
  isFulfilled: true
  isResolved: true
  isRejected: false
  isSettled: true
}
export type AsyncRejected<T, S = AbstractState<T>> = S & {
  data: T | undefined
  error: Error
  value: Error
  startedAt: Date
  finishedAt: Date
  status: "rejected"
  isInitial: false
  isPending: false
  isLoading: false
  isFulfilled: false
  isResolved: false
  isRejected: true
  isSettled: true
}

type BaseAsyncState<T, S> =
  | AsyncInitial<T, S>
  | AsyncPending<T, S>
  | AsyncFulfilled<T, S>
  | AsyncRejected<T, S>

export type ReducerBaseState<T> = Omit<
  AbstractState<T>,
  "run" | "reload" | "cancel" | "setData" | "setError"
>
export type ReducerAsyncState<T> = BaseAsyncState<T, ReducerBaseState<T>>

export type AsyncState<T, S extends AbstractState<T> = AbstractState<T>> = BaseAsyncState<T, S>
