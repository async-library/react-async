import React, { Component } from "react"
import Async from "react-async"
import "./App.css"

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Async promiseFn={() => Promise.resolve("foo")}>{({ data }: { data: string }) => data}</Async>
          <Async promiseFn={() => Promise.resolve("bar")}>
            <Async.Pending>{(data: string) => data}</Async.Pending>
          </Async>
        </header>
      </div>
    )
  }
}

export default App
