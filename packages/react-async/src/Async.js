import React from "react"

import globalScope from "./globalScope"
import { IfInitial, IfPending, IfFulfilled, IfRejected, IfSettled } from "./helpers"
import propTypes from "./propTypes"
import { actionTypes, init, dispatchMiddleware, reducer as asyncReducer } from "./reducer"

/**
 * createInstance allows you to create instances of Async that are bound to a specific promise.
 * A unique instance also uses its own React context for better nesting capability.
 */
export const createInstance = (defaultProps = {}, displayName = "Async") => {
  const { Consumer, Provider } = React.createContext()

  class Async extends React.Component {
    constructor(props) {
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

      this.mounted = false
      this.counter = 0
      this.args = []
      this.promise = undefined
      this.abortController = { abort: () => {} }
      this.state = {
        ...init({ initialValue, promise, promiseFn }),
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
      const reducer = _reducer
        ? (state, action) => _reducer(state, action, asyncReducer)
        : asyncReducer
      const dispatch = dispatchMiddleware((action, callback) => {
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

    componentDidUpdate(prevProps) {
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

    getMeta(meta) {
      return {
        counter: this.counter,
        promise: this.promise,
        debugLabel: this.debugLabel,
        ...meta,
      }
    }

    start(promiseFn) {
      if ("AbortController" in globalScope) {
        this.abortController.abort()
        this.abortController = new globalScope.AbortController()
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

    run(...args) {
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

    onResolve(counter) {
      return data => {
        if (this.counter === counter) {
          const onResolve = this.props.onResolve || defaultProps.onResolve
          this.setData(data, () => onResolve && onResolve(data))
        }
        return data
      }
    }

    onReject(counter) {
      return error => {
        if (this.counter === counter) {
          const onReject = this.props.onReject || defaultProps.onReject
          this.setError(error, () => onReject && onReject(error))
        }
        return error
      }
    }

    setData(data, callback) {
      this.mounted &&
        this.dispatch({ type: actionTypes.fulfill, payload: data, meta: this.getMeta() }, callback)
      return data
    }

    setError(error, callback) {
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
        return <Provider value={this.state}>{children(this.state)}</Provider>
      }
      if (children !== undefined && children !== null) {
        return <Provider value={this.state}>{children}</Provider>
      }
      return null
    }
  }

  if (propTypes) Async.propTypes = propTypes.Async

  const AsyncInitial = props => <Consumer>{st => <IfInitial {...props} state={st} />}</Consumer>
  const AsyncPending = props => <Consumer>{st => <IfPending {...props} state={st} />}</Consumer>
  const AsyncFulfilled = props => <Consumer>{st => <IfFulfilled {...props} state={st} />}</Consumer>
  const AsyncRejected = props => <Consumer>{st => <IfRejected {...props} state={st} />}</Consumer>
  const AsyncSettled = props => <Consumer>{st => <IfSettled {...props} state={st} />}</Consumer>

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
