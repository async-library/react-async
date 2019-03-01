import React from "react"
import Async from "react-async"
import { Route} from "react-router-dom"

const loader = fetchUrl => () =>
  fetch(fetchUrl)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

const AsyncRoute = ({ component: Component, fetchUrl, ...props }) => (
  <Route {...props} render={props => (
    <Async promiseFn={loader(fetchUrl)}>
      {asyncState => (
        <Component {...props} {...asyncState} />
      )}
    </Async>
  )} />
)

export default AsyncRoute