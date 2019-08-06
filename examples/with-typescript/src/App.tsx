import React, { Component } from "react"
import Async, { createInstance, useAsync, IfPending, IfRejected, IfFulfilled } from "react-async"
import DevTools from "react-async-devtools"
import "./App.css"

const promiseFn = () => Promise.resolve("baz")
const CustomAsync = createInstance({ promiseFn })

const UseAsync = () => {
  const state = useAsync({ promiseFn })
  return (
    <>
      <IfPending state={state}>Loading...</IfPending>
      <IfRejected state={state}>{error => `Something went wrong: ${error.message}`}</IfRejected>
      <IfFulfilled state={state}>
        {data => (
          <div>
            <strong>Loaded some data:</strong>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </IfFulfilled>
    </>
  )
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <DevTools />
        <header className="App-header">
          <Async promiseFn={() => Promise.resolve("foo")}>{({ data }) => <>{data}</>}</Async>
          <Async promiseFn={() => Promise.resolve("bar")}>
            <Async.Resolved>{data => <>{data}</>}</Async.Resolved>
          </Async>
          <CustomAsync>
            <CustomAsync.Resolved>{data => <>{data}</>}</CustomAsync.Resolved>
          </CustomAsync>
          <UseAsync />
        </header>
      </div>
    )
  }
}

export default App
