import React from "react"
import { createInstance } from "react-async"
import DevTools from "react-async-devtools"
import ReactDOM from "react-dom"
import "./index.css"

const loadUser = ({ userId }) =>
  fetch(`https://reqres.in/api/users/${userId}`)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

const AsyncUser = createInstance({ promiseFn: loadUser }, "AsyncUser")

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
    <AsyncUser context={{ userId: 1 }} debugLabel="User 1">
      {({ data, error, isPending }) => {
        if (isPending) return <UserPlaceholder />
        if (error) return <p>{error.message}</p>
        if (data) return <UserDetails data={data} />
        return null
      }}
    </AsyncUser>
    <AsyncUser context={{ userId: 2 }} debugLabel="User 2">
      <AsyncUser.Pending>
        <UserPlaceholder />
      </AsyncUser.Pending>
      <AsyncUser.Fulfilled>{data => <UserDetails data={data} />}</AsyncUser.Fulfilled>
      <AsyncUser.Rejected>{error => <p>{error.message}</p>}</AsyncUser.Rejected>
    </AsyncUser>
  </>
)

if (process.env.NODE_ENV !== "test") ReactDOM.render(<App />, document.getElementById("root"))
