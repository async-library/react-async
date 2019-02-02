import * as React from "react"

type AsyncChildren<T> = ((state: AsyncState<T>) => React.ReactNode) | React.ReactNode
type PromiseFn<T> = (props: object) => Promise<T>

interface AsyncOptions<T> {
  promiseFn?: (props: object, controller: AbortController) => Promise<T>
  deferFn?: (...args: any[]) => Promise<T>
  watch?: any
  initialValue?: T
  onResolve?: (data: T) => void
  onError?: (error: Error) => void
}

interface AsyncProps<T> extends AsyncOptions<T> {
  children?: AsyncChildren<T>
}

interface AsyncState<T> {
  initialValue?: T
  data?: T
  error?: Error
  isLoading: boolean
  startedAt?: Date
  finishedAt?: Date
  cancel: () => void
  run: (...args: any[]) => Promise<T>
  reload: () => void
  setData: (data: T, callback?: () => void) => T
  setError: (error: Error, callback?: () => void) => Error
}

declare class Async<T> extends React.Component<AsyncProps<T>, AsyncState<T>> {}

declare namespace Async {
  export function Pending<T>(props: { children?: AsyncChildren<T>; persist?: boolean }): React.ReactNode
  export function Loading<T>(props: { children?: AsyncChildren<T>; initial?: boolean }): React.ReactNode
  export function Resolved<T>(props: { children?: AsyncChildren<T>; persist?: boolean }): React.ReactNode
  export function Rejected<T>(props: { children?: AsyncChildren<T>; persist?: boolean }): React.ReactNode
}

declare function createInstance<T>(defaultProps?: AsyncProps<T>): Async<T>

export function useAsync<T>(opts: AsyncOptions<T> | PromiseFn<T>, init?: T): AsyncState<T>

export default createInstance
