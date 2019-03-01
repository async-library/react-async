import React from 'react';
import { NavLink } from 'react-router-dom'

const Header = () => (
  <div>
    <NavLink to="/">Contributors To react-async</NavLink>
    <NavLink to="/repositories">Other github repositories</NavLink>
  </div>);

export default Header;