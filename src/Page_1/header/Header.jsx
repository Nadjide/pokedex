import React, { useContext } from 'react'
import './header.css'
import logo from './logo.svg'
import { LanguageContext } from '../../Langue/LanguageContext.jsx'
import { Link } from 'react-router-dom'

export default function Header() {
  const { language, setLanguage } = useContext(LanguageContext)

  return (
    <div className="Header">
      <Link to="/">
        <img src={logo} alt="Logo" className="logo" />
      </Link>
      <select
        className="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="en">EN</option>
        <option value="fr">FR</option>
      </select>
    </div>
  )
}
