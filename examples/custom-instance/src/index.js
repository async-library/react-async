import React from "react"
import { createInstance } from "react-async"
import ReactDOM from "react-dom"
import "./index.css"

const loadUser = ({ userId }) =>
  fetch(`https://reqres.in/api/users/${userId}`)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

const AsyncUser = createInstance({
  promiseFn: loadUser,
})

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

const App = () => (
  <>
    <AsyncUser userId={1}>
      {({ data, error, isLoading }) => {
        if (isLoading) return <UserPlaceholder />
        if (error) return <p>{error.message}</p>
        if (data) return <UserDetails data={data} />
        return null
      }}
    </AsyncUser>

    <AsyncUser userId={2}>
      <AsyncUser.Loading>
        <UserPlaceholder />
      </AsyncUser.Loading>
      <AsyncUser.Resolved>{data => <UserDetails data={data} />}</AsyncUser.Resolved>
      <AsyncUser.Rejected>{error => <p>{error.message}</p>}</AsyncUser.Rejected>
    </AsyncUser>
  </>
)

ReactDOM.render(<App />, document.getElementById("root"))
