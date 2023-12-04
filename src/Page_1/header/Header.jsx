import React from 'react';
import './header.css';
import logo from './logo.svg'; 

export default function Header() {
  return (
    <div className="Header">
      <img src={logo} alt="logo" className="logo" />
      <select className="language-select">
        <option value="en">EN</option>
        <option value="fr">FR</option>
      </select>
    </div>
  )
}