import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from "react-router-dom";
import ApiRouter from './js/ApiRouter';
import ContributorsComponent from './js/ContributorsComponent';
import RepositoriesComponent from './js/RepositoriesComponent';
import Header from './js/Header';

const App = () => (
    <Router>
      <React.Fragment>
        <Header/>
        <ApiRouter exact path="/" fetchUrl='https://api.github.com/repos/ghengeveld/react-async/contributors' component={ContributorsComponent} />
        <ApiRouter path="/repositories" fetchUrl='https://api.github.com/repositories' component={RepositoriesComponent} />
      </React.Fragment>
    </Router>)

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('app'));
});