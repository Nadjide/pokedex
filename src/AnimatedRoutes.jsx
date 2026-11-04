// src/AnimatedRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { useLocation, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TransitionLayout from './components/AnimatedLayout/TransitionLayout.jsx';
import PokemonList from './Page_1/PokemonList/Pokemonlist.jsx';

const PokemonDetail = lazy(() => import('./Page_2/PokemonDetails/PokemonDetail.jsx'));

function NotFoundPage() {
  return (
    <Box sx={{ maxWidth: '600px', margin: '100px auto', padding: '24px', textAlign: 'center' }}>
      <Typography variant="h2" sx={{ color: '#e63946', fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'Poppins, sans-serif', my: 2 }}>
        Page introuvable / Page not found
      </Typography>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{
            background: '#e63946',
            color: '#fff',
            borderRadius: '50px',
            fontFamily: 'Poppins, sans-serif',
            textTransform: 'none',
            '&:hover': { background: '#d62828' },
          }}
        >
          Retour à l'accueil
        </Button>
      </Link>
    </Box>
  );
}

const RouteFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress sx={{ color: '#e63946' }} />
  </Box>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
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
