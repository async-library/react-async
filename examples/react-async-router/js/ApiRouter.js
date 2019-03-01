import React from "react"
import { Route} from "react-router-dom"
import Api from "./Api"

const ApiRouter = (props) => {
  const Child = props.component
  const c = () => (
    <Api fetchUrl={props.fetchUrl}>
      <Child {...props} />
    </Api>
  )
  return (<Route {...props} component={c} />)
}

export default ApiRouter