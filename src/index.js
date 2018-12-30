import React from "react"
export { default as useAsync } from "./useAsync"

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

      this.load = this.load.bind(this)
      this.run = this.run.bind(this)
      this.cancel = this.cancel.bind(this)
      this.onResolve = this.onResolve.bind(this)
      this.onReject = this.onReject.bind(this)
      this.setData = this.setData.bind(this)
      this.setError = this.setError.bind(this)

      const promiseFn = props.promiseFn || defaultProps.promiseFn
      const initialValue = props.initialValue || defaultProps.initialValue
      const initialError = initialValue instanceof Error ? initialValue : undefined
      const initialData = initialError ? undefined : initialValue

      this.mounted = false
      this.counter = 0
      this.args = []
      this.state = {
        initialValue,
        data: initialData,
        error: initialError,
        isLoading: !initialValue && isFunction(promiseFn),
        startedAt: undefined,
        finishedAt: initialValue ? new Date() : undefined,
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
      this.state.initialValue || this.load()
    }

    componentDidUpdate(prevProps) {
      if (prevProps.watch !== this.props.watch) this.load()
      if (prevProps.promiseFn !== this.props.promiseFn) {
        this.cancel()
        if (this.props.promiseFn) this.load()
      }
    }

    componentWillUnmount() {
      this.cancel()
      this.mounted = false
    }

    load() {
      const promiseFn = this.props.promiseFn || defaultProps.promiseFn
      if (!promiseFn) return
      this.counter++
      this.setState({ isLoading: true, startedAt: new Date(), finishedAt: undefined })
      return promiseFn(this.props).then(this.onResolve(this.counter), this.onReject(this.counter))
    }

    run(...args) {
      const deferFn = this.props.deferFn || defaultProps.deferFn
      if (!deferFn) return
      this.counter++
      this.args = args
      this.setState({ isLoading: true, startedAt: new Date(), finishedAt: undefined })
      return deferFn(...args, this.props).then(
        this.onResolve(this.counter),
        this.onReject(this.counter)
      )
    }

    cancel() {
      this.counter++
      this.setState({ isLoading: false, startedAt: undefined })
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

  /**
   * Renders only when deferred promise is pending (not yet run).
   *
   * @prop {boolean} persist Show until we have data, even while loading or when an error occurred
   * @prop {Function|Node} children Function (passing state) or React node
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

  /**
   * Renders only while loading.
   *
   * @prop {boolean} initial Show only on initial load (data is undefined)
   * @prop {Function|Node} children Function (passing state) or React node
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

  /**
   * Renders only when promise is resolved.
   *
   * @prop {boolean} persist Show old data while loading
   * @prop {Function|Node} children Function (passing data and state) or React node
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

  /**
   * Renders only when promise is rejected.
   *
   * @prop {boolean} persist Show old error while loading
   * @prop {Function|Node} children Function (passing error and state) or React node
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
