import React from "react"

let PropTypes
try {
  PropTypes = require("prop-types")
} catch (e) {}

const isFunction = arg => typeof arg === "function"

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
      const initialError = initialValue instanceof Error ? initialValue : undefined
      const initialData = initialError ? undefined : initialValue

      this.mounted = false
      this.counter = 0
      this.args = []
      this.abortController = { abort: () => {} }
      this.state = {
        initialValue,
        data: initialData,
        error: initialError,
        isLoading: !!promise || (promiseFn && !initialValue),
        startedAt: promise ? new Date() : undefined,
        finishedAt: initialValue ? new Date() : undefined,
        counter: this.counter,
        cancel: this.cancel,
        run: this.run,
        reload: () => {
          this.load()
          this.run(...this.args)
        },
        setData: this.setData,
        setError: this.setError,
      }
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

    start() {
      if ("AbortController" in window) {
        this.abortController.abort()
        this.abortController = new window.AbortController()
      }
      this.counter++
      this.setState({
        isLoading: true,
        startedAt: new Date(),
        finishedAt: undefined,
        counter: this.counter,
      })
    }

    load() {
      const promise = this.props.promise
      if (promise) {
        this.start()
        return promise.then(this.onResolve(this.counter), this.onReject(this.counter))
      }

      const promiseFn = this.props.promiseFn || defaultProps.promiseFn
      if (promiseFn) {
        this.start()
        return promiseFn(this.props, this.abortController).then(
          this.onResolve(this.counter),
          this.onReject(this.counter)
        )
      }
    }

    run(...args) {
      const deferFn = this.props.deferFn || defaultProps.deferFn
      if (deferFn) {
        this.args = args
        this.start()
        return deferFn(args, { ...defaultProps, ...this.props }, this.abortController).then(
          this.onResolve(this.counter),
          this.onReject(this.counter)
        )
      }
    }

    cancel() {
      this.counter++
      this.abortController.abort()
      this.setState({ isLoading: false, startedAt: undefined, counter: this.counter })
    }

    onResolve(counter) {
      return data => {
        if (this.mounted && this.counter === counter) {
          const onResolve = this.props.onResolve || defaultProps.onResolve
          this.setData(data, () => onResolve && onResolve(data))
        }
        return data
      }
    }

    onReject(counter) {
      return error => {
        if (this.mounted && this.counter === counter) {
          const onReject = this.props.onReject || defaultProps.onReject
          this.setError(error, () => onReject && onReject(error))
        }
        return error
      }
    }

    setData(data, callback) {
      this.setState({ data, error: undefined, isLoading: false, finishedAt: new Date() }, callback)
      return data
    }

    setError(error, callback) {
      this.setState({ error, isLoading: false, finishedAt: new Date() }, callback)
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
    }
  }

  /**
   * Renders only when deferred promise is pending (not yet run).
   *
   * @prop {Function|Node} children Function (passing state) or React node
   * @prop {boolean} persist Show until we have data, even while loading or when an error occurred
   */
  const Pending = ({ children, persist }) => (
    <Consumer>
      {state => {
        if (state.data !== undefined) return null
        if (!persist && state.isLoading) return null
        if (!persist && state.error !== undefined) return null
        return isFunction(children) ? children(state) : children || null
      }}
    </Consumer>
  )

  if (PropTypes) {
    Pending.propTypes = {
      children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
      persist: PropTypes.bool,
    }
  }

  /**
   * Renders only while loading.
   *
   * @prop {Function|Node} children Function (passing state) or React node
   * @prop {boolean} initial Show only on initial load (data is undefined)
   */
  const Loading = ({ children, initial }) => (
    <Consumer>
      {state => {
        if (!state.isLoading) return null
        if (initial && state.data !== undefined) return null
        return isFunction(children) ? children(state) : children || null
      }}
    </Consumer>
  )

  if (PropTypes) {
    Loading.propTypes = {
      children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
      initial: PropTypes.bool,
    }
  }

  /**
   * Renders only when promise is resolved.
   *
   * @prop {Function|Node} children Function (passing data and state) or React node
   * @prop {boolean} persist Show old data while loading
   */
  const Resolved = ({ children, persist }) => (
    <Consumer>
      {state => {
        if (state.data === undefined) return null
        if (!persist && state.isLoading) return null
        if (!persist && state.error !== undefined) return null
        return isFunction(children) ? children(state.data, state) : children || null
      }}
    </Consumer>
  )

  if (PropTypes) {
    Resolved.propTypes = {
      children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
      persist: PropTypes.bool,
    }
  }

  /**
   * Renders only when promise is rejected.
   *
   * @prop {Function|Node} children Function (passing error and state) or React node
   * @prop {boolean} persist Show old error while loading
   */
  const Rejected = ({ children, persist }) => (
    <Consumer>
      {state => {
        if (state.error === undefined) return null
        if (state.isLoading && !persist) return null
        return isFunction(children) ? children(state.error, state) : children || null
      }}
    </Consumer>
  )

  if (PropTypes) {
    Rejected.propTypes = {
      children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
      persist: PropTypes.bool,
    }
  }

  Async.Pending = Pending
  Async.Loading = Loading
  Async.Resolved = Resolved
  Async.Rejected = Rejected

  Async.displayName = displayName
  Async.Pending.displayName = `${displayName}.Pending`
  Async.Loading.displayName = `${displayName}.Loading`
  Async.Resolved.displayName = `${displayName}.Resolved`
  Async.Rejected.displayName = `${displayName}.Rejected`

  return Async
}

export default createInstance()
