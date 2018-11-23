import * as React from "react"

type AsyncChildren<T> = ((state: AsyncState<T>) => React.ReactNode) | React.ReactNode

interface AsyncProps<T> {
  promiseFn?: (props: object) => Promise<T>
  deferFn?: (...args, props: object) => Promise<T>
  watch?: any
  initialValue?: T
  onResolve?: (data: T) => void
  onError?: (error: Error) => void
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
  run: (...args) => Promise<T>
  reload: () => void
  setData: (data: T, callback?: () => void) => T
  setError: (error: Error, callback?: () => void) => Error
}

declare class Async<T> extends React.Component<AsyncProps<T>, AsyncState<T>> {
  static Pending: React.FunctionComponent<{ children?: AsyncChildren<T>; persist?: boolean }>
  static Loading: React.FunctionComponent<{ children?: AsyncChildren<T>; initial?: boolean }>
  static Resolved: React.FunctionComponent<{ children?: AsyncChildren<T>; persist?: boolean }>
  static Rejected: React.FunctionComponent<{ children?: AsyncChildren<T>; persist?: boolean }>
}

declare function createInstance<T>(defaultProps?: AsyncProps<T>): Async<T>

export default createInstance
