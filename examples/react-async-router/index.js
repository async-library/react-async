import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, NavLink } from "react-router-dom"
import AsyncRoute from "./js/AsyncRoute"
import Contributors from "./js/Contributors"
import Repositories from "./js/Repositories"

const App = () => (
  <Router>
    <>
      <div>
        <NavLink to="/">Contributors To react-async</NavLink>
        <NavLink to="/repositories">Other github repositories</NavLink>
      </div>
      <AsyncRoute 
        exact
        path="/" 
        fetchUrl="https://api.github.com/repos/ghengeveld/react-async/contributors" 
        component={Contributors} 
      />
      <AsyncRoute
        path="/repositories"
        fetchUrl="https://api.github.com/repositories"
        component={Repositories}
      />
    </>
  </Router>
)

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<App />, document.getElementById("app"))
})
