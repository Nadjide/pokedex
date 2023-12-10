import React, { useContext } from 'react';
import './header.css';
import logo from './logo.svg';
import { LanguageContext } from '../../Langue/LanguageContext.jsx';

export default function Header() {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
      <div className="Header">
        <img src={logo} alt="logo" className="logo" />
        <select
          className="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">EN</option>
          <option value="fr">FR</option>
        </select>
      </div>
  );
}