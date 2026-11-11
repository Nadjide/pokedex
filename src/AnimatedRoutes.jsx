// src/AnimatedRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { useLocation, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Box, CircularProgress, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TransitionLayout from './components/AnimatedLayout/TransitionLayout.jsx';
import PokemonList from './Page_1/PokemonList/Pokemonlist.jsx';
import PokeballMark from './components/PokeballMark.jsx';
import { pillButtonSx } from './components/FavoriteButton.jsx';
import { useTranslation } from './i18n/translations.js';

const PokemonDetail = lazy(() => import('./Page_2/PokemonDetails/PokemonDetail.jsx'));
const TeamPage = lazy(() => import('./Page_3/Team/TeamPage.jsx'));

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: 560,
        mx: 'auto',
        my: { xs: 8, md: 12 },
        px: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <PokeballMark outline size={96} style={{ color: 'var(--text-faint)', opacity: 0.4 }} />
      <Typography
        component="h1"
        sx={{
          mt: 3,
          mb: 1.5,
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '4.5rem',
          lineHeight: 1,
          color: 'var(--accent)',
        }}
      >
        404
      </Typography>
      <Typography
        component="h2"
        sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', mb: 1 }}
      >
        {t('pageNotFound')}
      </Typography>
      <Typography sx={{ color: 'var(--text-muted)', mb: 3.5 }}>{t('pageNotFoundDesc')}</Typography>
      <Box component={Link} to="/" sx={{ ...pillButtonSx, textDecoration: 'none' }}>
        <ArrowBackIcon />
        {t('backHome')}
      </Box>
    </Box>
  );
}

const RouteFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress sx={{ color: 'var(--accent)' }} />
  </Box>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <TransitionLayout>
              <PokemonList />
            </TransitionLayout>
          }
        />
        <Route
          path="/pokemon/:id"
          element={
            <TransitionLayout>
              <Suspense fallback={<RouteFallback />}>
                <PokemonDetail />
              </Suspense>
            </TransitionLayout>
          }
        />
        <Route
          path="/team"
          element={
            <TransitionLayout>
              <Suspense fallback={<RouteFallback />}>
                <TeamPage />
              </Suspense>
            </TransitionLayout>
          }
        />
        <Route
          path="*"
          element={
            <TransitionLayout>
              <NotFoundPage />
            </TransitionLayout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
