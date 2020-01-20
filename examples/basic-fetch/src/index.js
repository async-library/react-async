import React from "react"
import Async from "react-async"
import DevTools from "react-async-devtools"
import ReactDOM from "react-dom"
import "./index.css"

const loadUser = ({ userId }) =>
  fetch(`https://reqres.in/api/users/${userId}`)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

const UserPlaceholder = () => (
  <div className="user placeholder">
    <div className="avatar" />
    <div className="name">══════</div>
  </div>
)

const UserDetails = ({ data }) => (
  <div className="user">
    <img className="avatar" src={data.data.avatar} alt="" />
    <div className="name">
      {data.data.first_name} {data.data.last_name}
    </div>
  </div>
)

export const App = () => (
  <>
    <DevTools />
    <Async promiseFn={loadUser} context={{ userId: 1 }} debugLabel="User 1">
      {({ data, error, isPending }) => {
        if (isPending) return <UserPlaceholder />
        if (error) return <p>{error.message}</p>
        if (data) return <UserDetails data={data} />
        return null
      }}
    </Async>

    <Async promiseFn={loadUser} context={{ userId: 2 }} debugLabel="User 2">
      <Async.Pending>
        <UserPlaceholder />
      </Async.Pending>
      <Async.Fulfilled>{data => <UserDetails data={data} />}</Async.Fulfilled>
      <Async.Rejected>{error => <p>{error.message}</p>}</Async.Rejected>
    </Async>
  </>
)

if (process.env.NODE_ENV !== "test") ReactDOM.render(<App />, document.getElementById("root"))
