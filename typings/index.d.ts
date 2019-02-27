import * as React from "react"

type AsyncChildren<T> = ((state: AsyncState<T>) => React.ReactNode) | React.ReactNode
type PromiseFn<T> = (props: object) => Promise<T>

interface AsyncOptions<T> {
  promiseFn?: (props: object, controller: AbortController) => Promise<T>
  deferFn?: (args: any[], props: object, controller: AbortController) => Promise<T>
  watch?: any
  watchFn?: (props: object, prevProps: object) => any
  initialValue?: T
  onResolve?: (data: T) => void
  onReject?: (error: Error) => void
}

interface AsyncProps<T> extends AsyncOptions<T> {
  children?: AsyncChildren<T>
}

interface AsyncState<T> {
  data?: T
  error?: Error
  initialValue?: T
  isLoading: boolean
  startedAt?: Date
  finishedAt?: Date
  counter: number
  cancel: () => void
  run: (...args: any[]) => Promise<T>
  reload: () => void
  setData: (data: T, callback?: () => void) => T
  setError: (error: Error, callback?: () => void) => Error
}

declare class Async<T> extends React.Component<AsyncProps<T>, AsyncState<T>> {}

declare namespace Async {
  export function Pending<T>(props: {
    children?: AsyncChildren<T>
    persist?: boolean
  }): React.ReactNode
  export function Loading<T>(props: {
    children?: AsyncChildren<T>
    initial?: boolean
  }): React.ReactNode
  export function Resolved<T>(props: {
    children?: AsyncChildren<T>
    persist?: boolean
  }): React.ReactNode
  export function Rejected<T>(props: {
    children?: AsyncChildren<T>
    persist?: boolean
  }): React.ReactNode
}

declare function createInstance<T>(defaultProps?: AsyncProps<T>): Async<T>

export function useAsync<T>(
  arg1: AsyncOptions<T> | PromiseFn<T>,
  arg2?: AsyncOptions<T>
): AsyncState<T>

interface FetchInit {
  method?: string
  headers?: Headers | object
}

export function useFetch<T>(
  input: Request | string,
  init?: FetchInit,
  options?: AsyncOptions<T>
): AsyncState<T>

export default createInstance
