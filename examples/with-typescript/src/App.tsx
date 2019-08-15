import React, { Component } from "react"
import Async, {
  createInstance,
  useAsync,
  IfPending,
  IfRejected,
  IfFulfilled,
  PromiseFn,
} from "react-async"
import DevTools from "react-async-devtools"
import "./App.css"
import { FetchHookExample } from "./FetchHookExample";

const loadFirstName: PromiseFn<string> = ({ userId }) =>
  fetch(`https://reqres.in/api/users/${userId}`)
    .then(res => (res.ok ? Promise.resolve(res) : Promise.reject(res)))
    .then(res => res.json())
    .then(({ data }) => data.first_name)

const CustomAsync = createInstance({ promiseFn: loadFirstName })

const UseAsync = () => {
  const state = useAsync({ promiseFn: loadFirstName, userId: 1 })
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
          <CustomAsync userId={1}>
            <CustomAsync.Resolved>{data => <>{data}</>}</CustomAsync.Resolved>
          </CustomAsync>
          <UseAsync />
          <FetchHookExample />
        </header>
      </div>
    )
  }
}

export default App
