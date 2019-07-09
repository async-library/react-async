import React from "react"
import Async from "react-async"
import DevTools from "react-async-devtools"
import fetch from "isomorphic-fetch"
import Link from "next/link"

const loadUser = ({ userId = 1 }) =>
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
    const { userId = 1 } = url.query
    return (
      <>
        {process.browser && <DevTools />}
        <Async
          promiseFn={loadUser}
          debugLabel={`User ${userId}`}
          userId={userId}
          watch={userId}
          initialValue={data}
        >
          <Async.Pending>
            <p>Loading...</p>
          </Async.Pending>
          <Async.Fulfilled>
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
          </Async.Fulfilled>
          <i>
            This data is initially loaded server-side, then client-side when navigating prev/next.
          </i>
        </Async>
      </>
    )
  }
}

export default Hello
