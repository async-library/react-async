import React from "react"

const getInitialState = () => ({
  data: undefined,
  error: undefined,
  isLoading: false,
  startedAt: undefined,
  finishedAt: undefined
})

const { Consumer, Provider } = React.createContext(getInitialState())

/**
 * Renders only when promise is rejected.
 *
 * @prop {boolean} persist Show old error while loading
 * @prop {Function|Node} children Function (passing error and finishedAt) or React node
 */
class Async extends React.Component {
  mounted = false
  counter = 0
  args = []
  state = getInitialState()

  componentDidMount() {
    this.mounted = true
    this.load()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.watch !== this.props.watch) this.load()
  }

  componentWillUnmount() {
    this.cancel()
    this.mounted = false
  }

  load = () => {
    if (!this.props.promiseFn) return
    this.counter++
    this.setState({ isLoading: true, startedAt: new Date(), finishedAt: undefined })
    return this.props.promiseFn().then(this.onResolve(this.counter), this.onReject(this.counter))
  }

  run = (...args) => {
    if (!this.props.deferFn) return
    this.counter++
    this.args = args
    this.setState({ isLoading: true, startedAt: new Date(), finishedAt: undefined })
    return this.props.deferFn(...args).then(this.onResolve(this.counter), this.onReject(this.counter))
  }

  cancel = () => {
    this.counter++
    this.setState({ isLoading: false, startedAt: undefined })
  }

  onResolve = counter => data => {
    if (this.mounted && this.counter === counter) {
      this.setData(data, () => this.props.onResolve && this.props.onResolve(data))
    }
    return data
  }

  onReject = counter => error => {
    if (this.mounted && this.counter === counter) {
      this.setError(error, () => this.props.onReject && this.props.onReject(error))
    }
    return error
  }

  setData = (data, callback) => {
    this.setState({ data, error: undefined, isLoading: false, finishedAt: new Date() }, callback)
    return data
  }

  setError = (error, callback) => {
    this.setState({ error, isLoading: false, finishedAt: new Date() }, callback)
    return error
  }

  render() {
    const renderProps = {
      ...this.state,
      cancel: this.cancel,
      run: this.run,
      reload: () => {
        this.load()
        this.run(...this.args)
      },
      setData: this.setData,
      setError: this.setError
    }

    if (typeof this.props.children === "function") {
      return this.props.children(renderProps)
    }

    if (this.props.children) {
      return <Provider value={renderProps}>{this.props.children}</Provider>
    }

    return null
  }
}

/**
 * Renders only while loading.
 *
 * @prop {boolean} initial Show only on initial load (data is undefined)
 * @prop {Function|Node} children Function (passing props) or React node
 */
Async.Loading = ({ children, initial }) => (
  <Consumer>
    {props => {
      if (!props.isLoading) return null
      if (initial && props.data !== undefined) return null
      return typeof children === "function" ? children(props) : children || null
    }}
  </Consumer>
)

/**
 * Renders only when promise is resolved.
 *
 * @prop {boolean} persist Show old data while loading
 * @prop {Function|Node} children Function (passing data and props) or React node
 */
Async.Resolved = ({ children, persist }) => (
  <Consumer>
    {props => {
      if (props.data === undefined) return null
      if (props.isLoading && !persist) return null
      return typeof children === "function" ? children(props.data, props) : children || null
    }}
  </Consumer>
)

/**
 * Renders only when promise is rejected.
 *
 * @prop {boolean} persist Show old error while loading
 * @prop {Function|Node} children Function (passing error and props) or React node
 */
Async.Rejected = ({ children, persist }) => (
  <Consumer>
    {props => {
      if (props.error === undefined) return null
      if (props.isLoading && !persist) return null
      return typeof children === "function" ? children(props.error, props) : children || null
    }}
  </Consumer>
)

export default Async
