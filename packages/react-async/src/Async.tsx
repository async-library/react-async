import React, { ComponentClass } from "react"

import globalScope from "./globalScope"
import { IfInitial, IfPending, IfFulfilled, IfRejected, IfSettled } from "./helpers"
// @ts-ignore
import propTypes from "./propTypes"
import { actionTypes, init, dispatchMiddleware, reducer as asyncReducer } from "./reducer"

export declare type AsyncChildren<T> = ((state: AsyncState<T>) => React.ReactNode) | React.ReactNode
export declare type InitialChildren<T> =
  | ((state: AsyncInitial<T>) => React.ReactNode)
  | React.ReactNode
export declare type PendingChildren<T> =
  | ((state: AsyncPending<T>) => React.ReactNode)
  | React.ReactNode
export declare type FulfilledChildren<T> =
  | ((data: T, state: AsyncFulfilled<T>) => React.ReactNode)
  | React.ReactNode
export declare type RejectedChildren<T> =
  | ((error: Error, state: AsyncRejected<T>) => React.ReactNode)
  | React.ReactNode
export declare type SettledChildren<T> =
  | ((state: AsyncFulfilled<T> | AsyncRejected<T>) => React.ReactNode)
  | React.ReactNode

export declare type PromiseFn<T> = (props: AsyncProps<T>, controller: AbortController) => Promise<T>
export declare type DeferFn<T> = (
  args: any[],
  props: AsyncProps<T>,
  controller: AbortController
) => Promise<T>

export interface AbstractAction {
  type: string
  meta: { counter: number; [meta: string]: any }
}
export type Meta = AbstractAction["meta"]

export declare type Start = AbstractAction & { type: "start"; payload: () => Promise<void> }
export declare type Cancel = AbstractAction & { type: "cancel" }
export declare type Fulfill<T> = AbstractAction & { type: "fulfill"; payload: T }
export declare type Reject = AbstractAction & { type: "reject"; payload: Error; error: true }
export declare type AsyncAction<T> = Start | Cancel | Fulfill<T> | Reject

export declare interface AsyncOptions<T> {
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
  [prop: string]: any
}

export declare interface AsyncProps<T> extends AsyncOptions<T> {
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

export declare type AsyncInitial<T, S = AbstractState<T>> = S & {
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
export declare type AsyncPending<T, S = AbstractState<T>> = S & {
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
export declare type AsyncFulfilled<T, S = AbstractState<T>> = S & {
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
export declare type AsyncRejected<T, S = AbstractState<T>> = S & {
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
export declare type AsyncState<T, S extends AbstractState<T> = AbstractState<T>> =
  | AsyncInitial<T, S>
  | AsyncPending<T, S>
  | AsyncFulfilled<T, S>
  | AsyncRejected<T, S>

export declare class Async<T> extends React.Component<AsyncProps<T>, AsyncState<T>> {}

interface AsyncConstructor<T> extends ComponentClass<AsyncProps<T>> {
  new (): Async<T>
  Initial: React.FC<{ children?: InitialChildren<T>; persist?: boolean }>
  Pending: React.FC<{ children?: PendingChildren<T>; initial?: boolean }>
  Loading: React.FC<{ children?: PendingChildren<T>; initial?: boolean }>
  Fulfilled: React.FC<{ children?: FulfilledChildren<T>; persist?: boolean }>
  Resolved: React.FC<{ children?: FulfilledChildren<T>; persist?: boolean }>
  Rejected: React.FC<{ children?: RejectedChildren<T>; persist?: boolean }>
  Settled: React.FC<{ children?: SettledChildren<T>; persist?: boolean }>
}

/**
 * createInstance allows you to create instances of Async that are bound to a specific promise.
 * A unique instance also uses its own React context for better nesting capability.
 */
export const createInstance = <T extends {}>(
  defaultProps: AsyncProps<T> = {},
  displayName = "Async"
): AsyncConstructor<T> => {
  const { Consumer, Provider } = React.createContext<AsyncState<T>>(undefined as any)

  type Props = AsyncProps<T>

  const Async: AsyncConstructor<T> = class extends React.Component<Props, AsyncState<T>> {
    private mounted = false
    private counter = 0
    private args: any[] = []
    private promise?: Promise<T> = undefined
    private abortController: AbortController = { abort: () => {} } as any
    private debugLabel?: string
    private dispatch: (action: AsyncAction<T>, ...args: any[]) => void

    constructor(props: Props) {
      super(props)

      this.start = this.start.bind(this)
      this.load = this.load.bind(this)
      this.run = this.run.bind(this)
      this.cancel = this.cancel.bind(this)
      this.onResolve = this.onResolve.bind(this)
      this.onReject = this.onReject.bind(this)
      this.setData = this.setData.bind(this)
      this.setError = this.setError.bind(this)

      const promise = props.promise
      const promiseFn = props.promiseFn || defaultProps.promiseFn
      const initialValue = props.initialValue || defaultProps.initialValue

      this.state = {
        ...init<T>({ initialValue, promise, promiseFn }),
        cancel: this.cancel,
        run: this.run,
        reload: () => {
          this.load()
          this.run(...this.args)
        },
        setData: this.setData,
        setError: this.setError,
      }
      this.debugLabel = props.debugLabel || defaultProps.debugLabel

      const { devToolsDispatcher } = globalScope.__REACT_ASYNC__
      const _reducer = props.reducer || defaultProps.reducer
      const _dispatcher = props.dispatcher || defaultProps.dispatcher || devToolsDispatcher
      const reducer: (state: AsyncState<T>, action: AsyncAction<T>) => AsyncState<T> = _reducer
        ? (state, action) => _reducer(state, action, asyncReducer)
        : asyncReducer
      const dispatch = dispatchMiddleware<T>((action, callback) => {
        this.setState(state => reducer(state, action), callback)
      })
      this.dispatch = _dispatcher ? action => _dispatcher(action, dispatch, props) : dispatch
    }

    componentDidMount() {
      this.mounted = true
      if (this.props.promise || !this.state.initialValue) {
        this.load()
      }
    }

    componentDidUpdate(prevProps: Props) {
      const { watch, watchFn = defaultProps.watchFn, promise, promiseFn } = this.props
      if (watch !== prevProps.watch) {
        if (this.counter) this.cancel()
        return this.load()
      }
      if (
        watchFn &&
        watchFn({ ...defaultProps, ...this.props }, { ...defaultProps, ...prevProps })
      ) {
        if (this.counter) this.cancel()
        return this.load()
      }
      if (promise !== prevProps.promise) {
        if (this.counter) this.cancel()
        if (promise) return this.load()
      }
      if (promiseFn !== prevProps.promiseFn) {
        if (this.counter) this.cancel()
        if (promiseFn) return this.load()
      }
    }

    componentWillUnmount() {
      this.cancel()
      this.mounted = false
    }

    getMeta<M>(meta?: M) {
      return {
        counter: this.counter,
        promise: this.promise,
        debugLabel: this.debugLabel,
        ...meta,
      }
    }

    start(promiseFn: () => Promise<T>) {
      if ("AbortController" in globalScope) {
        this.abortController.abort()
        this.abortController = new globalScope.AbortController!()
      }
      this.counter++
      return (this.promise = new Promise((resolve, reject) => {
        if (!this.mounted) return
        const executor = () => promiseFn().then(resolve, reject)
        this.dispatch({ type: actionTypes.start, payload: executor, meta: this.getMeta() })
      }))
    }

    load() {
      const promise = this.props.promise
      const promiseFn = this.props.promiseFn || defaultProps.promiseFn
      if (promise) {
        this.start(() => promise)
          .then(this.onResolve(this.counter))
          .catch(this.onReject(this.counter))
      } else if (promiseFn) {
        const props = { ...defaultProps, ...this.props }
        this.start(() => promiseFn(props, this.abortController))
          .then(this.onResolve(this.counter))
          .catch(this.onReject(this.counter))
      }
    }

    run(...args: any[]) {
      const deferFn = this.props.deferFn || defaultProps.deferFn
      if (deferFn) {
        this.args = args
        const props = { ...defaultProps, ...this.props }
        return this.start(() => deferFn(args, props, this.abortController)).then(
          this.onResolve(this.counter),
          this.onReject(this.counter)
        )
      }
    }

    cancel() {
      const onCancel = this.props.onCancel || defaultProps.onCancel
      onCancel && onCancel()
      this.counter++
      this.abortController.abort()
      this.mounted && this.dispatch({ type: actionTypes.cancel, meta: this.getMeta() })
    }

    onResolve(counter: Number) {
      return (data: T) => {
        if (this.counter === counter) {
          const onResolve = this.props.onResolve || defaultProps.onResolve
          this.setData(data, () => onResolve && onResolve(data))
        }
        return data
      }
    }

    onReject(counter: Number) {
      return (error: Error) => {
        if (this.counter === counter) {
          const onReject = this.props.onReject || defaultProps.onReject
          this.setError(error, () => onReject && onReject(error))
        }
        return error
      }
    }

    setData(data: T, callback?: () => void) {
      this.mounted &&
        this.dispatch({ type: actionTypes.fulfill, payload: data, meta: this.getMeta() }, callback)
      return data
    }

    setError(error: Error, callback?: () => void) {
      this.mounted &&
        this.dispatch(
          { type: actionTypes.reject, payload: error, error: true, meta: this.getMeta() },
          callback
        )
      return error
    }

    render() {
      const { children } = this.props
      if (typeof children === "function") {
        return (
          <Provider value={this.state}>
            {(children as ((state: AsyncState<T>) => React.ReactNode))(this.state)}
          </Provider>
        )
      }
      if (children !== undefined && children !== null) {
        return <Provider value={this.state}>{children}</Provider>
      }
      return null
    }
  } as any

  if (propTypes) (Async as React.ComponentClass).propTypes = propTypes.Async

  const AsyncInitial: AsyncConstructor<T>["Initial"] = props => (
    <Consumer>
      {(st: AsyncState<T, AbstractState<T>>) => <IfInitial {...props} state={st} />}
    </Consumer>
  )
  const AsyncPending: AsyncConstructor<T>["Pending"] = props => (
    <Consumer>
      {(st: AsyncState<T, AbstractState<T>>) => <IfPending {...props} state={st} />}
    </Consumer>
  )
  const AsyncFulfilled: AsyncConstructor<T>["Fulfilled"] = props => (
    <Consumer>
      {(st: AsyncState<T, AbstractState<T>>) => <IfFulfilled {...props} state={st} />}
    </Consumer>
  )
  const AsyncRejected: AsyncConstructor<T>["Rejected"] = props => (
    <Consumer>
      {(st: AsyncState<T, AbstractState<T>>) => <IfRejected {...props} state={st} />}
    </Consumer>
  )
  const AsyncSettled: AsyncConstructor<T>["Settled"] = props => (
    <Consumer>
      {(st: AsyncState<T, AbstractState<T>>) => <IfSettled {...props} state={st} />}
    </Consumer>
  )

  AsyncInitial.displayName = `${displayName}.Initial`
  AsyncPending.displayName = `${displayName}.Pending`
  AsyncFulfilled.displayName = `${displayName}.Fulfilled`
  AsyncRejected.displayName = `${displayName}.Rejected`
  AsyncSettled.displayName = `${displayName}.Settled`

  Async.displayName = displayName
  Async.Initial = AsyncInitial
  Async.Pending = AsyncPending
  Async.Loading = AsyncPending // alias
  Async.Fulfilled = AsyncFulfilled
  Async.Resolved = AsyncFulfilled // alias
  Async.Rejected = AsyncRejected
  Async.Settled = AsyncSettled

  return Async
}

export default createInstance()
