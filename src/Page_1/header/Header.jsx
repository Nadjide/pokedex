import React, { useContext } from 'react';
import { AppBar, Toolbar, Select, MenuItem, Box } from '@mui/material';
import { styled } from '@mui/system';
import { LanguageContext } from '../../Langue/LanguageContext.jsx';
import { Link } from 'react-router-dom';
import logo from './logo.svg';

const StyledAppBar = styled(AppBar)({
  background: 'linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #16213e 100%)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
  borderBottom: '2px solid #e63946',
});

const StyledToolbar = styled(Toolbar)({
  minHeight: '64px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 24px',
});

const LogoWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  '& img': {
    height: '40px',
    filter: 'drop-shadow(0 0 8px rgba(230, 57, 70, 0.6))',
    transition: 'filter 0.3s ease',
  },
  '&:hover img': {
    filter: 'drop-shadow(0 0 16px rgba(230, 57, 70, 1))',
  },
});

const StyledSelect = styled(Select)({
  backgroundColor: 'rgba(255,255,255,0.07)',
  color: '#fff',
  borderRadius: '20px',
  '& .MuiOutlinedInput-notchedOutline': {
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: '1px solid rgba(230, 57, 70, 0.6)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #e63946',
  },
  '& .MuiSelect-icon': { color: '#fff' },
  '& .MuiSelect-select': {
    padding: '8px 16px',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
});

export default function Header() {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <StyledAppBar position="sticky">
      <StyledToolbar>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <LogoWrapper>
            <img src={logo} alt="Pokédex" />
          </LogoWrapper>
        </Link>
        <StyledSelect
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          variant="outlined"
        >
          <MenuItem value="en" style={{ fontFamily: 'Poppins, sans-serif' }}>🇬🇧 EN</MenuItem>
          <MenuItem value="fr" style={{ fontFamily: 'Poppins, sans-serif' }}>🇫🇷 FR</MenuItem>
        </StyledSelect>
      </StyledToolbar>
    </StyledAppBar>
  );
}