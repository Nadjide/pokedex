import React, { useContext, useEffect } from 'react';
import { AppBar, Toolbar, Select, MenuItem, Box, Typography } from '@mui/material';
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
  minHeight: '68px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 24px',
  maxWidth: '1400px',
  width: '100%',
  margin: '0 auto',
});

const LogoWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  textDecoration: 'none',
  '& img': {
    height: '42px',
    filter: 'drop-shadow(0 0 10px rgba(230, 57, 70, 0.7))',
    transition: 'filter 0.3s ease, transform 0.3s ease',
  },
  '&:hover img': {
    filter: 'drop-shadow(0 0 18px rgba(230, 57, 70, 1))',
    transform: 'scale(1.04)',
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

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <StyledAppBar position="sticky">
      <StyledToolbar>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <LogoWrapper>
            <img src={logo} alt="Pokédex" />
            <Typography
              variant="h6"
              sx={{
                color: '#fff',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 800,
                letterSpacing: '0.05em',
                display: { xs: 'none', sm: 'block' },
                background: 'linear-gradient(90deg, #ffffff, #e63946)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              POKÉDEX
            </Typography>
          </LogoWrapper>
        </Link>
        <StyledSelect
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          variant="outlined"
          size="small"
          aria-label="Language selector"
        >
          <MenuItem value="fr" style={{ fontFamily: 'Poppins, sans-serif' }}>🇫🇷 FR</MenuItem>
          <MenuItem value="en" style={{ fontFamily: 'Poppins, sans-serif' }}>🇬🇧 EN</MenuItem>
        </StyledSelect>
      </StyledToolbar>
    </StyledAppBar>
  );
}
