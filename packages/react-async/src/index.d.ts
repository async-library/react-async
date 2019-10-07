import * as React from "react"

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
  watchFn?: (props: AsyncProps<T>, prevProps: AsyncProps<T>) => any
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
    props: AsyncProps<T>
  ) => void
  debugLabel?: string
  suspense?: boolean
  [prop: string]: any
}

export interface AsyncProps<T> extends AsyncOptions<T> {
  children?: AsyncChildren<T>
}

interface AbstractState<T> {
  initialValue?: T | Error
  counter: number
  promise: Promise<T>
  run: (...args: any[]) => void
  reload: () => void
  cancel: () => void
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

export class Async<T> extends React.Component<AsyncProps<T>, AsyncState<T>> {}

export namespace Async {
  export function Initial<T>(props: {
    children?: InitialChildren<T>
    persist?: boolean
  }): JSX.Element
  export function Pending<T>(props: {
    children?: PendingChildren<T>
    initial?: boolean
  }): JSX.Element
  export function Loading<T>(props: {
    children?: PendingChildren<T>
    initial?: boolean
  }): JSX.Element
  export function Fulfilled<T>(props: {
    children?: FulfilledChildren<T>
    persist?: boolean
  }): JSX.Element
  export function Resolved<T>(props: {
    children?: FulfilledChildren<T>
    persist?: boolean
  }): JSX.Element
  export function Rejected<T>(props: {
    children?: RejectedChildren<T>
    persist?: boolean
  }): JSX.Element
  export function Settled<T>(props: {
    children?: SettledChildren<T>
    persist?: boolean
  }): JSX.Element
}

export function createInstance<T>(
  defaultOptions?: AsyncProps<T>,
  displayName?: string
): (new () => Async<T>) & {
  Initial<T>(props: { children?: InitialChildren<T>; persist?: boolean }): JSX.Element
  Pending<T>(props: { children?: PendingChildren<T>; initial?: boolean }): JSX.Element
  Loading<T>(props: { children?: PendingChildren<T>; initial?: boolean }): JSX.Element
  Fulfilled<T>(props: { children?: FulfilledChildren<T>; persist?: boolean }): JSX.Element
  Resolved<T>(props: { children?: FulfilledChildren<T>; persist?: boolean }): JSX.Element
  Rejected<T>(props: { children?: RejectedChildren<T>; persist?: boolean }): JSX.Element
  Settled<T>(props: { children?: SettledChildren<T>; persist?: boolean }): JSX.Element
}

export function IfInitial<T>(props: {
  children?: InitialChildren<T>
  persist?: boolean
  state: AsyncState<T>
}): JSX.Element
export function IfPending<T>(props: {
  children?: PendingChildren<T>
  initial?: boolean
  state: AsyncState<T>
}): JSX.Element
export function IfFulfilled<T>(props: {
  children?: FulfilledChildren<T>
  persist?: boolean
  state: AsyncState<T>
}): JSX.Element
export function IfRejected<T>(props: {
  children?: RejectedChildren<T>
  persist?: boolean
  state: AsyncState<T>
}): JSX.Element
export function IfSettled<T>(props: {
  children?: SettledChildren<T>
  persist?: boolean
  state: AsyncState<T>
}): JSX.Element

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
): AsyncInitialWithout<"run", T> & FetchRun<T>

// unfortunately, we cannot just omit K from AsyncInitial as that would unbox the Discriminated Union
type AsyncInitialWithout<K extends keyof AsyncInitial<T>, T> =
  | Omit<AsyncInitial<T>, K>
  | Omit<AsyncPending<T>, K>
  | Omit<AsyncFulfilled<T>, K>
  | Omit<AsyncRejected<T>, K>

type OverrideParams = { resource?: RequestInfo } & Partial<RequestInit>

type FetchRun<T> = {
  run(overrideParams: (params?: OverrideParams) => OverrideParams): void
  run(overrideParams: OverrideParams): void
  run(ignoredEvent: React.SyntheticEvent): void
  run(ignoredEvent: Event): void
  run(): void
}

export class FetchError extends Error {
  response: Response
}

export default Async
