import React from "react"
import Async from "react-async"

const loader = fetchUrl =>
  fetch(fetchUrl)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

const Api = ({ fetchUrl, children }) => (
  <Async promiseFn={() => loader(fetchUrl)}>
    {({ data, error, isLoading }) => {
      const childrenWithProps = React.Children.map(children, child =>
        React.cloneElement(child, { data, error, isLoading })
      )
      return (
        <div>{childrenWithProps}</div>
      )
    }}
  </Async>
)

export default Api