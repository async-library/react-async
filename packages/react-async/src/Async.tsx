import React from "react"

import globalScope, { MockAbortController } from "./globalScope"
import { IfInitial, IfPending, IfFulfilled, IfRejected, IfSettled } from "./helpers"
import propTypes from "./propTypes"
import {
  neverSettle,
  ActionTypes,
  init,
  dispatchMiddleware,
  reducer as asyncReducer,
} from "./reducer"
import {
  AsyncProps,
  AsyncState,
  InitialChildren,
  PendingChildren,
  FulfilledChildren,
  SettledChildren,
  RejectedChildren,
  AsyncAction,
  ReducerAsyncState,
} from "./types"

export interface InitialProps<T> {
  children?: InitialChildren<T>
  persist?: boolean
}
export interface PendingProps<T> {
  children?: PendingChildren<T>
  initial?: boolean
}
export interface FulfilledProps<T> {
  children?: FulfilledChildren<T>
  persist?: boolean
}
export interface RejectedProps<T> {
  children?: RejectedChildren<T>
  persist?: boolean
}
export interface SettledProps<T> {
  children?: SettledChildren<T>
  persist?: boolean
}

class Async<T> extends React.Component<AsyncProps<T>, AsyncState<T>> {}
type GenericAsync = typeof Async & {
  Initial<T>(props: InitialProps<T>): JSX.Element
  Pending<T>(props: PendingProps<T>): JSX.Element
  Loading<T>(props: PendingProps<T>): JSX.Element
  Fulfilled<T>(props: FulfilledProps<T>): JSX.Element
  Resolved<T>(props: FulfilledProps<T>): JSX.Element
  Rejected<T>(props: RejectedProps<T>): JSX.Element
  Settled<T>(props: SettledProps<T>): JSX.Element
}

export type AsyncConstructor<T> = React.ComponentClass<AsyncProps<T>> & {
  Initial: React.FC<InitialProps<T>>
  Pending: React.FC<PendingProps<T>>
  Loading: React.FC<PendingProps<T>>
  Fulfilled: React.FC<FulfilledProps<T>>
  Resolved: React.FC<FulfilledProps<T>>
  Rejected: React.FC<RejectedProps<T>>
  Settled: React.FC<SettledProps<T>>
}

/**
 * createInstance allows you to create instances of Async that are bound to a specific promise.
 * A unique instance also uses its own React context for better nesting capability.
 */
export function createInstance<T>(
  defaultOptions: AsyncProps<T> = {},
  displayName = "Async"
): AsyncConstructor<T> {
  const { Consumer: UnguardedConsumer, Provider } = React.createContext<AsyncState<T> | undefined>(
    undefined
  )
  function Consumer({ children }: { children: (value: AsyncState<T>) => React.ReactNode }) {
    return (
      <UnguardedConsumer>
        {value => {
          if (!value) {
            throw new Error(
              "this component should only be used within an associated <Async> component!"
            )
          }
          return children(value)
        }}
      </UnguardedConsumer>
    )
  }

  type Props = AsyncProps<T>
  type State = AsyncState<T>
  type Constructor = AsyncConstructor<T>

  class Async extends React.Component<Props, State> {
    private mounted = false
    private counter = 0
    private args: any[] = []
    private promise?: Promise<T> = neverSettle
    private abortController: AbortController = new MockAbortController()
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
      const promiseFn = props.promiseFn || defaultOptions.promiseFn
      const initialValue = props.initialValue || defaultOptions.initialValue

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
      this.debugLabel = props.debugLabel || defaultOptions.debugLabel

      const { devToolsDispatcher } = globalScope.__REACT_ASYNC__
      const _reducer = props.reducer || defaultOptions.reducer
      const _dispatcher = props.dispatcher || defaultOptions.dispatcher || devToolsDispatcher
      const reducer: (
        state: ReducerAsyncState<T>,
        action: AsyncAction<T>
      ) => ReducerAsyncState<T> = _reducer
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
      const { watch, watchFn = defaultOptions.watchFn, promise, promiseFn } = this.props
      if (watch !== prevProps.watch) {
        if (this.counter) this.cancel()
        return this.load()
      }
      if (
        watchFn &&
        watchFn({ ...defaultOptions, ...this.props }, { ...defaultOptions, ...prevProps })
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
        this.dispatch({ type: ActionTypes.start, payload: executor, meta: this.getMeta() })
      }))
    }

    load() {
      const promise = this.props.promise
      const promiseFn = this.props.promiseFn || defaultOptions.promiseFn
      if (promise) {
        this.start(() => promise)
          .then(this.onResolve(this.counter))
          .catch(this.onReject(this.counter))
      } else if (promiseFn) {
        const props = { ...defaultOptions, ...this.props }
        this.start(() => promiseFn(props, this.abortController))
          .then(this.onResolve(this.counter))
          .catch(this.onReject(this.counter))
      }
    }

    run(...args: any[]) {
      const deferFn = this.props.deferFn || defaultOptions.deferFn
      if (deferFn) {
        this.args = args
        const props = { ...defaultOptions, ...this.props }
        return this.start(() => deferFn(args, props, this.abortController)).then(
          this.onResolve(this.counter),
          this.onReject(this.counter)
        )
      }
    }

    cancel() {
      const onCancel = this.props.onCancel || defaultOptions.onCancel
      onCancel && onCancel()
      this.counter++
      this.abortController.abort()
      this.mounted && this.dispatch({ type: ActionTypes.cancel, meta: this.getMeta() })
    }

    onResolve(counter: Number) {
      return (data: T) => {
        if (this.counter === counter) {
          const onResolve = this.props.onResolve || defaultOptions.onResolve
          this.setData(data, () => onResolve && onResolve(data))
        }
        return data
      }
    }

    onReject(counter: Number) {
      return (error: Error) => {
        if (this.counter === counter) {
          const onReject = this.props.onReject || defaultOptions.onReject
          this.setError(error, () => onReject && onReject(error))
        }
        return error
      }
    }

    setData(data: T, callback?: () => void) {
      this.mounted &&
        this.dispatch({ type: ActionTypes.fulfill, payload: data, meta: this.getMeta() }, callback)
      return data
    }

    setError(error: Error, callback?: () => void) {
      this.mounted &&
        this.dispatch(
          { type: ActionTypes.reject, payload: error, error: true, meta: this.getMeta() },
          callback
        )
      return error
    }

    render() {
      const { children, suspense } = this.props
      if (suspense && this.state.isPending && this.promise !== neverSettle) {
        // Rely on Suspense to handle the loading state
        throw this.promise
      }
      if (typeof children === "function") {
        const render = children as (state: State) => React.ReactNode
        return <Provider value={this.state}>{render(this.state)}</Provider>
      }
      if (children !== undefined && children !== null) {
        return <Provider value={this.state}>{children}</Provider>
      }
      return null
    }
  }

  if (propTypes) (Async as React.ComponentClass).propTypes = propTypes.Async

  const AsyncInitial: Constructor["Initial"] = props => (
    <Consumer>{st => <IfInitial {...props} state={st} />}</Consumer>
  )
  const AsyncPending: Constructor["Pending"] = props => (
    <Consumer>{st => <IfPending {...props} state={st} />}</Consumer>
  )
  const AsyncFulfilled: Constructor["Fulfilled"] = props => (
    <Consumer>{st => <IfFulfilled {...props} state={st} />}</Consumer>
  )
  const AsyncRejected: Constructor["Rejected"] = props => (
    <Consumer>{st => <IfRejected {...props} state={st} />}</Consumer>
  )
  const AsyncSettled: Constructor["Settled"] = props => (
    <Consumer>{st => <IfSettled {...props} state={st} />}</Consumer>
  )

  AsyncInitial.displayName = `${displayName}.Initial`
  AsyncPending.displayName = `${displayName}.Pending`
  AsyncFulfilled.displayName = `${displayName}.Fulfilled`
  AsyncRejected.displayName = `${displayName}.Rejected`
  AsyncSettled.displayName = `${displayName}.Settled`

  return Object.assign(Async, {
    displayName: displayName,
    Initial: AsyncInitial,
    Pending: AsyncPending,
    Loading: AsyncPending, // alias
    Fulfilled: AsyncFulfilled,
    Resolved: AsyncFulfilled, // alias
    Rejected: AsyncRejected,
    Settled: AsyncSettled,
  })
}

export default createInstance() as GenericAsync
