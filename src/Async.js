import React from "react"
import { actionTypes, init, dispatchMiddleware, reducer as asyncReducer } from "./reducer"

let PropTypes
try {
  PropTypes = require("prop-types")
} catch (e) {}

const isFunction = arg => typeof arg === "function"
const renderFn = (children, ...args) =>
  isFunction(children) ? children(...args) : children === undefined ? null : children

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

      const { devToolsDispatcher } = window.__REACT_ASYNC__ || {}
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
      if (watch !== prevProps.watch) this.load()
      if (watchFn && watchFn({ ...defaultProps, ...this.props }, { ...defaultProps, ...prevProps }))
        this.load()
      if (promise !== prevProps.promise) {
        if (promise) this.load()
        else this.cancel()
      }
      if (promiseFn !== prevProps.promiseFn) {
        if (promiseFn) this.load()
        else this.cancel()
      }
    }

    componentWillUnmount() {
      this.cancel()
      this.mounted = false
    }

    getMeta(meta) {
      return {
        counter: this.counter,
        debugLabel: this.debugLabel,
        ...meta,
      }
    }

    start(promiseFn) {
      if ("AbortController" in window) {
        this.abortController.abort()
        this.abortController = new window.AbortController()
      }
      this.counter++
      return new Promise((resolve, reject) => {
        if (!this.mounted) return
        const executor = () => promiseFn().then(resolve, reject)
        this.dispatch({ type: actionTypes.start, payload: executor, meta: this.getMeta() })
      })
    }

    load() {
      const promise = this.props.promise
      if (promise) {
        return this.start(() => promise).then(
          this.onResolve(this.counter),
          this.onReject(this.counter)
        )
      }
      const promiseFn = this.props.promiseFn || defaultProps.promiseFn
      if (promiseFn) {
        const props = { ...defaultProps, ...this.props }
        return this.start(() => promiseFn(props, this.abortController)).then(
          this.onResolve(this.counter),
          this.onReject(this.counter)
        )
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
      if (isFunction(children)) {
        return <Provider value={this.state}>{children(this.state)}</Provider>
      }
      if (children !== undefined && children !== null) {
        return <Provider value={this.state}>{children}</Provider>
      }
      return null
    }
  }

  if (PropTypes) {
    Async.propTypes = {
      children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
      promise: PropTypes.instanceOf(Promise),
      promiseFn: PropTypes.func,
      deferFn: PropTypes.func,
      watch: PropTypes.any,
      watchFn: PropTypes.func,
      initialValue: PropTypes.any,
      onResolve: PropTypes.func,
      onReject: PropTypes.func,
      reducer: PropTypes.func,
      dispatcher: PropTypes.func,
      debugLabel: PropTypes.string,
    }
  }

  /**
   * Renders only when no promise has started or completed yet.
   *
   * @prop {Function|Node} children Function (passing state) or React node
   * @prop {boolean} persist Show until we have data, even while pending (loading) or when an error occurred
   */
  const Initial = ({ children, persist }) => (
    <Consumer>
      {state => (state.isInitial || (persist && !state.data) ? renderFn(children, state) : null)}
    </Consumer>
  )

  if (PropTypes) {
    Initial.propTypes = {
      children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
      persist: PropTypes.bool,
    }
  }

  /**
   * Renders only while pending (promise is loading).
   *
   * @prop {Function|Node} children Function (passing state) or React node
   * @prop {boolean} initial Show only on initial load (data/error is undefined)
   */
  const Pending = ({ children, initial }) => (
    <Consumer>
      {state => (state.isPending && (!initial || !state.value) ? renderFn(children, state) : null)}
    </Consumer>
  )

  if (PropTypes) {
    Pending.propTypes = {
      children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
      initial: PropTypes.bool,
    }
  }

  /**
   * Renders only when promise is resolved.
   *
   * @prop {Function|Node} children Function (passing data and state) or React node
   * @prop {boolean} persist Show old data while pending (promise is loading)
   */
  const Fulfilled = ({ children, persist }) => (
    <Consumer>
      {state =>
        state.isFulfilled || (persist && state.data) ? renderFn(children, state.data, state) : null
      }
    </Consumer>
  )

  if (PropTypes) {
    Fulfilled.propTypes = {
      children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
      persist: PropTypes.bool,
    }
  }

  /**
   * Renders only when promise is rejected.
   *
   * @prop {Function|Node} children Function (passing error and state) or React node
   * @prop {boolean} persist Show old error while pending (promise is loading)
   */
  const Rejected = ({ children, persist }) => (
    <Consumer>
      {state =>
        state.isRejected || (persist && state.error) ? renderFn(children, state.error, state) : null
      }
    </Consumer>
  )

  if (PropTypes) {
    Rejected.propTypes = {
      children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
      persist: PropTypes.bool,
    }
  }

  /**
   * Renders only when promise is fulfilled or rejected.
   *
   * @prop {Function|Node} children Function (passing state) or React node
   * @prop {boolean} persist Continue rendering while loading new data
   */
  const Settled = ({ children, persist }) => (
    <Consumer>
      {state => (state.isSettled || (persist && state.value) ? renderFn(children, state) : null)}
    </Consumer>
  )

  if (PropTypes) {
    Settled.propTypes = {
      children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
      persist: PropTypes.bool,
    }
  }

  Initial.displayName = `${displayName}.Initial`
  Pending.displayName = `${displayName}.Pending`
  Fulfilled.displayName = `${displayName}.Fulfilled`
  Rejected.displayName = `${displayName}.Rejected`
  Settled.displayName = `${displayName}.Settled`

  Async.displayName = displayName
  Async.Initial = Initial
  Async.Pending = Pending
  Async.Loading = Pending // alias
  Async.Fulfilled = Fulfilled
  Async.Resolved = Fulfilled // alias
  Async.Rejected = Rejected
  Async.Settled = Settled

  return Async
}

export default createInstance()
