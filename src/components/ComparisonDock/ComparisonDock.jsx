// src/components/ComparisonDock/ComparisonDock.jsx
import React, { useContext } from 'react';
import { useComparison } from '../../Comparison/ComparisonContext.jsx';
import { LanguageContext } from '../../Langue/LanguageContext.jsx';
import {
  Button,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Wrapper Lazy pour le graphique
const PokemonRadarChart = React.lazy(() => import('../PokemonRadarChart/PokemonRadarChart.jsx'));

const ComparisonDock = () => {
  const { selectedPokemons, clearComparison, toggleComparison } = useComparison();
  const { language } = useContext(LanguageContext);
  const [open, setOpen] = React.useState(false);

  // Auto-open si 2 Pokémons sélectionnés
  React.useEffect(() => {
    if (selectedPokemons.length === 2) {
      setOpen(true);
    }
  }, [selectedPokemons.length]);

  if (selectedPokemons.length === 0) return null;

  return (
    <React.Fragment>
      {/* Floating Action Button */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <Button
          variant="contained"
          onClick={() => setOpen(!open)}
          startIcon={<CompareArrowsIcon />}
          sx={{
            background: 'linear-gradient(135deg, #e63946 0%, #d62828 100%)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: '50px',
            px: 2.5,
            py: 1.2,
            boxShadow: '0 8px 24px rgba(230, 57, 70, 0.4)',
            fontFamily: 'Poppins, sans-serif',
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': {
              background: 'linear-gradient(135deg, #ff4d5a 0%, #e63946 100%)',
              boxShadow: '0 12px 30px rgba(230, 57, 70, 0.6)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.25s ease',
          }}
        >
          {language === 'fr' ? 'Comparer' : 'Compare'}
          <Chip
            size="small"
            label={`${selectedPokemons.length}/2`}
            sx={{
              ml: 1.2,
              backgroundColor: 'rgba(255,255,255,0.25)',
              color: '#fff',
              fontWeight: 800,
              height: 22,
              fontSize: '0.75rem',
            }}
          />
        </Button>
      </Box>

      {/* Drawer */}
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, #16162a 0%, #0d0d1a 100%)',
            color: '#fff',
            borderTop: '2px solid rgba(230, 57, 70, 0.5)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
            maxHeight: '85vh',
            backdropFilter: 'blur(16px)',
          },
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            px: { xs: 2, md: 4 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CompareArrowsIcon sx={{ color: '#e63946' }} />
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
              {language === 'fr' ? 'Comparateur de Pokémon' : 'Pokémon Comparator'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={clearComparison}
              color="error"
              size="small"
              startIcon={<DeleteOutlineIcon />}
              sx={{
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'none',
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { color: '#ff6b6b', background: 'rgba(255,0,0,0.1)' },
              }}
            >
              {language === 'fr' ? 'Vider' : 'Clear'}
            </Button>
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Box>
        </Toolbar>

        <Box
          sx={{
            p: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {/* Zone Graphique */}
          <Box sx={{ flex: 1, width: '100%', minHeight: 360, maxWidth: 650 }}>
            {selectedPokemons[0] && (
              <React.Suspense
                fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins, sans-serif' }}>
                      {language === 'fr' ? 'Chargement du graphique...' : 'Loading chart...'}
                    </Typography>
                  </Box>
                }
              >
                <PokemonRadarChart
                  pokemon1={selectedPokemons[0]}
                  pokemon2={selectedPokemons[1] || null}
                  language={language}
                />
              </React.Suspense>
            )}
          </Box>

          {/* Liste latérale */}
          <List
            disablePadding
            disableGutters
            sx={{
              width: { xs: '100%', md: 320 },
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
              p: 1.5,
            }}
          >
            {selectedPokemons.map((p, index) => {
              const pName = p.names?.[language] || p.names?.fr || p.names?.en || `#${p.id}`;
              const badgeColor = index === 0 ? '#e63946' : '#4cc9f0';

              return (
                <ListItem
                  key={p.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => toggleComparison(p)}
                      aria-label="Remove"
                      sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#ff6b6b' } }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    borderRadius: '12px',
                    mb: 1,
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderLeft: `4px solid ${badgeColor}`,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={p.image}
                      alt={pName}
                      variant="rounded"
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: 'transparent',
                        img: { objectFit: 'contain' },
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
                        {pName}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins, sans-serif' }}
                      >
                        #{String(p.id).padStart(3, '0')} • {p.types?.join(' / ')}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}

            {selectedPokemons.length === 1 && (
              <Box
                sx={{
                  p: 2,
                  textAlign: 'center',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.85rem',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {language === 'fr'
                  ? 'Sélectionnez un 2ᵉ Pokémon pour comparer'
                  : 'Select a 2nd Pokémon to compare'}
              </Box>
            )}
          </List>
        </Box>
      </Drawer>
    </React.Fragment>
  );
};

export default ComparisonDock;
