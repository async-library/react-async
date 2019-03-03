import React from "react"
import Async from "react-async"
import fetch from "isomorphic-fetch"
import Link from "next/link"

const loadUser = ({ userId }) =>
  fetch(`https://reqres.in/api/users/${userId}`)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())
    .then(data => data.data)

class Hello extends React.Component {
  static async getInitialProps({ query }) {
    const data = await loadUser(query)
    return { data }
  }

  render() {
    const { data, url } = this.props
    const { userId } = url.query
    return (
      <Async promiseFn={loadUser} userId={userId} watch={userId} initialValue={data}>
        <Async.Loading>
          <p>Loading...</p>
        </Async.Loading>
        <Async.Resolved>
          {data => (
            <>
              <p>
                [{userId}] Hello {data.first_name}
              </p>
              <p>
                {userId > 1 && (
                  <Link href={`?userId=${userId - 1}`}>
                    <a>Prev</a>
                  </Link>
                )}{" "}
                {userId < 12 && (
                  <Link href={`?userId=${data.id + 1}`}>
                    <a>Next</a>
                  </Link>
                )}
              </p>
            </>
          )}
        </Async.Resolved>
        <i>
          This data is initially loaded server-side, then client-side when navigating prev/next.
        </i>
      </Async>
    )
  }
}

export default Hello
