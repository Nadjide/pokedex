import React, { useContext } from 'react';
import { AppBar, Toolbar, IconButton, Select, MenuItem, Box } from '@mui/material';
import { styled } from '@mui/system';
import { LanguageContext } from '../../Langue/LanguageContext.jsx';
import { Link } from 'react-router-dom';
import logo from './logo.svg';

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#282c34',
});

const StyledToolbar = styled(Toolbar)({
  minHeight: '48px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const StyledIconButton = styled(IconButton)({
  height: 50,
  width: 50,
  '& img': {
    height: '100%',
    marginLeft: "100px",
  }
});

const StyledSelect = styled(Select)({
  marginRight: 10,
  backgroundColor: '#282c34',
  color: '#fff',
  '& .MuiSelect-select': {
    padding: '10px 20px',
  },
  '& .MuiSelect-icon': {
    color: '#fff',
  },
});

export default function Header() {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <Box>
          <Link to="/">
            <StyledIconButton edge="start" color="inherit" aria-label="menu">
              <img src={logo} alt="Logo" />
            </StyledIconButton>
          </Link>
        </Box>
        <Box>
          <StyledSelect
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disableUnderline
          >
            <MenuItem value="en">EN</MenuItem>
            <MenuItem value="fr">FR</MenuItem>
          </StyledSelect>
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  );
}