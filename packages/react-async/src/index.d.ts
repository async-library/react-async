import { Component } from "react"

export type AsyncChildren<T> = ((state: AsyncState<T>) => JSX.Element) | JSX.Element
export type PromiseFn<T> = (props: object, controller: AbortController) => Promise<T>
export type DeferFn<T> = (args: any[], props: object, controller: AbortController) => Promise<T>

interface AbstractAction {
  type: string
  meta: { counter: number; [meta: string]: any }
}
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
  watchFn?: (props: object, prevProps: object) => any
  initialValue?: T
  onResolve?: (data: T) => void
  onReject?: (error: Error) => void
  reducer?: (
    state: AsyncState<T>,
    action: AsyncAction<T>,
    internalReducer: (state: AsyncState<T>, action: AsyncAction<T>) => AsyncState<T>
  ) => AsyncState<T>
  dispatcher?: (
    action: AsyncAction<T>,
    internalDispatch: (action: AsyncAction<T>) => void,
    props: object
  ) => void
  debugLabel?: string
  [prop: string]: any
}

export interface AsyncProps<T> extends AsyncOptions<T> {
  children?: AsyncChildren<T>
}

interface AbstractState<T> {
  initialValue?: T | Error
  counter: number
  cancel: () => void
  run: (...args: any[]) => Promise<T>
  reload: () => void
  setData: (data: T, callback?: () => void) => T
  setError: (error: Error, callback?: () => void) => Error
}

export type AsyncInitial<T> = AbstractState<T> & {
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
export type AsyncPending<T> = AbstractState<T> & {
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
export type AsyncFulfilled<T> = AbstractState<T> & {
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
export type AsyncRejected<T> = AbstractState<T> & {
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
export type AsyncState<T> = AsyncInitial<T> | AsyncPending<T> | AsyncFulfilled<T> | AsyncRejected<T>

export class Async<T> extends Component<AsyncProps<T>, AsyncState<T>> {}

export namespace Async {
  export function Initial<T>(props: { children?: AsyncChildren<T>; persist?: boolean }): JSX.Element
  export function Pending<T>(props: { children?: AsyncChildren<T>; initial?: boolean }): JSX.Element
  export function Loading<T>(props: { children?: AsyncChildren<T>; initial?: boolean }): JSX.Element
  export function Fulfilled<T>(props: {
    children?: AsyncChildren<T>
    persist?: boolean
  }): JSX.Element
  export function Resolved<T>(props: {
    children?: AsyncChildren<T>
    persist?: boolean
  }): JSX.Element
  export function Rejected<T>(props: {
    children?: AsyncChildren<T>
    persist?: boolean
  }): JSX.Element
  export function Settled<T>(props: { children?: AsyncChildren<T>; persist?: boolean }): JSX.Element
}

export function createInstance<T>(
  defaultProps?: AsyncProps<T>
): (new () => Async<T>) & {
  Initial<T>(props: { children?: AsyncChildren<T>; persist?: boolean }): JSX.Element
  Pending<T>(props: { children?: AsyncChildren<T>; initial?: boolean }): JSX.Element
  Loading<T>(props: { children?: AsyncChildren<T>; initial?: boolean }): JSX.Element
  Fulfilled<T>(props: { children?: AsyncChildren<T>; persist?: boolean }): JSX.Element
  Resolved<T>(props: { children?: AsyncChildren<T>; persist?: boolean }): JSX.Element
  Rejected<T>(props: { children?: AsyncChildren<T>; persist?: boolean }): JSX.Element
  Settled<T>(props: { children?: AsyncChildren<T>; persist?: boolean }): JSX.Element
}

export function useAsync<T>(
  arg1: AsyncOptions<T> | PromiseFn<T>,
  arg2?: AsyncOptions<T>
): AsyncState<T>

export interface FetchOptions<T> extends AsyncOptions<T> {
  defer?: boolean
  json?: boolean
}

export function useFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
  options?: FetchOptions<T>
): AsyncState<T>

export default Async
