import React, { Component } from "react"
import Async, { createInstance } from "react-async"
import DevTools from "react-async-devtools"
import "./App.css"

const promiseFn = () => Promise.resolve("baz")
const CustomAsync = createInstance({ promiseFn })

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
        </header>
      </div>
    )
  }
}

export default App
