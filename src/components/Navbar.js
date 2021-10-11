import React from 'react'

const Navbar = ({ accounts }) => {
  return (
    <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
      <a
        className="navbar-brand col-sm-3 col-md-2 mr-0"
        href="https://shield-portfolio.herokuapp.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Shield Marketplace
      </a>
      <small className="text-white">{accounts}</small>
    </nav>
  )
}

export default Navbar
