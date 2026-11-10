import React, { useLayoutEffect, useMemo } from 'react';
import { Link, useNavigate, useNavigationType } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CasinoIcon from '@mui/icons-material/Casino';
import EastIcon from '@mui/icons-material/East';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import PokemonCard from '../PokemonCard/PokemonCard';
import PokemonCardSkeleton from '../PokemonCard/PokemonCardSkeleton';
import { useFavorites } from '../../FavoritesContext';
import { usePokemon } from '../../context/PokemonContext.jsx';
import { useFilter } from '../../components/FilterShield/FilterContext.jsx';
import AdvancedSearch from '../../components/AdvancedSearch/AdvancedSearch.jsx';
import PokemonArtwork from '../../components/PokemonArtwork.jsx';
import PokeballMark from '../../components/PokeballMark.jsx';
import TypeBadge from '../../components/TypeBadge.jsx';
import { pillButtonSx } from '../../components/FavoriteButton.jsx';
import { useTranslation } from '../../i18n/translations.js';
import { filterAndSortPokemons } from '../../utils/filterPokemons.js';
import { getTypeColor } from '../../Theme/typeColors.js';
import { formatId, getPokemonName } from '../../utils/pokemon.js';

// Position de défilement de la liste, conservée le temps d'une visite sur une fiche.
let savedScrollY = 0;

const pageSx = {
  maxWidth: 'var(--page-max)',
  mx: 'auto',
  px: { xs: 2, md: 3 },
};

const gridSx = {
  display: 'grid',
  gridTemplateColumns: {
    xs: 'repeat(2, minmax(0, 1fr))',
    sm: 'repeat(auto-fill, minmax(196px, 1fr))',
  },
  gap: { xs: 1.5, sm: 2.25 },
};

const primaryButtonSx = {
  ...pillButtonSx,
  height: 46,
  px: '20px',
  background: 'var(--accent)',
  borderColor: 'var(--accent)',
  color: '#fff',
  boxShadow: '0 10px 24px -10px var(--accent)',
  '&:hover': { transform: 'translateY(-2px)', background: 'var(--accent-strong)', borderColor: 'var(--accent-strong)' },
};

function HeroStat({ value, label }) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.6rem',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500, mt: 0.5 }}>
        {label}
      </Typography>
    </Box>
  );
}

function FeaturedPokemon({ pokemon }) {
  const { t, language } = useTranslation();
  const types = pokemon.types?.length ? pokemon.types : ['normal'];

  return (
    <Box
      component={Link}
      to={`/pokemon/${pokemon.id}`}
      style={{ '--type': getTypeColor(types[0]), '--type-2': getTypeColor(types[1] || types[0]) }}
      sx={{
        position: 'relative',
        isolation: 'isolate',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        alignItems: 'flex-start',
        minHeight: 300,
        p: 3.5,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'var(--text)',
        background:
          'linear-gradient(140deg, color-mix(in srgb, var(--type) var(--hero-tint), var(--surface)) 0%, color-mix(in srgb, var(--type-2) 12%, var(--surface)) 100%)',
        border: '1px solid color-mix(in srgb, var(--type) 34%, var(--border))',
        boxShadow: 'var(--shadow-md)',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 30px 60px -28px color-mix(in srgb, var(--type) 80%, transparent), var(--shadow-md)',
        },
        '&:hover .featured-art': { transform: 'scale(1.07) rotate(-3deg)' },
        '&:hover .featured-cta svg': { transform: 'translateX(4px)' },
      }}
    >
      <PokeballMark
        outline
        size={340}
        style={{
          position: 'absolute',
          right: -70,
          bottom: -90,
          zIndex: -1,
          color: 'var(--type)',
          opacity: 0.16,
          animation: 'spin-slow 60s linear infinite',
        }}
      />

      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          height: 30,
          px: 1.5,
          borderRadius: 999,
          background: 'color-mix(in srgb, var(--surface) 70%, transparent)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
          fontSize: '0.76rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 15, color: 'var(--star)' }} />
        {t('pokemonOfTheDay')}
      </Box>

      <Typography
        sx={{
          mt: 3,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}
      >
        {formatId(pokemon.id)}
      </Typography>
      <Typography
        sx={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '2.1rem',
          lineHeight: 1.1,
          textTransform: 'capitalize',
          maxWidth: '55%',
          overflowWrap: 'anywhere',
        }}
      >
        {getPokemonName(pokemon, language)}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5, maxWidth: '50%' }}>
        {types.map((type) => (
          <TypeBadge key={type} type={type} size="md" />
        ))}
      </Box>

      <Box
        className="featured-cta"
        sx={{
          mt: 'auto',
          pt: 3,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          fontSize: '0.9rem',
          fontWeight: 600,
          '& svg': { fontSize: 18, transition: 'transform 0.3s ease' },
        }}
      >
        {t('viewDetails')}
        <EastIcon />
      </Box>

      <PokemonArtwork
        pokemon={pokemon}
        alt=""
        loading="eager"
        className="featured-art"
        sx={{
          position: 'absolute',
          right: '2%',
          bottom: '4%',
          width: '50%',
          maxWidth: 250,
          filter: 'drop-shadow(0 18px 22px rgba(0, 0, 0, 0.35))',
        }}
      />
    </Box>
  );
}

function StateMessage({ icon, title, description, action }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: { xs: 7, md: 10 },
        px: 3,
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-strong)',
        background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          background: 'var(--surface-2)',
          color: 'var(--text-muted)',
          mb: 2.5,
          '& svg': { fontSize: 34 },
        }}
      >
        {icon}
      </Box>
      <Typography
        component="h2"
        sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', mb: 0.75 }}
      >
        {title}
      </Typography>
      <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 420, mb: action ? 3 : 0 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
}

export default function PokemonList() {
  const { t, language } = useTranslation();
  const { favorites } = useFavorites();
  const { pokemons, loading, error, refetch } = usePokemon();
  const { types, searchTerm, activeTypeFilters, favoritesOnly, sortOrder, clearFilters } = useFilter();
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  // Retour depuis une fiche : on retrouve la liste là où on l'avait laissée.
  useLayoutEffect(() => {
    window.scrollTo(0, navigationType === 'POP' ? savedScrollY : 0);
    return () => {
      savedScrollY = window.scrollY;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPokemons = useMemo(
    () =>
      filterAndSortPokemons(pokemons, {
        searchTerm,
        activeTypeFilters,
        favoritesOnly,
        sortOrder,
        favorites,
        language,
      }),
    [pokemons, searchTerm, activeTypeFilters, favoritesOnly, sortOrder, favorites, language]
  );

  // Change chaque jour, identique pour toute la journée.
  const featured = useMemo(() => {
    if (pokemons.length === 0) return null;
    const now = new Date();
    const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    return pokemons[dayNumber % pokemons.length];
  }, [pokemons]);

  const hasActiveFilters =
    activeTypeFilters.length > 0 || searchTerm !== '' || favoritesOnly || sortOrder !== 'id-asc';
  const count = filteredPokemons.length;
  const total = pokemons.length;

  const goToRandom = () => {
    if (total === 0) return;
    const random = pokemons[Math.floor(Math.random() * total)];
    navigate(`/pokemon/${random.id}`);
  };

  let content;
  if (loading) {
    content = (
      <Box sx={gridSx} role="status" aria-busy="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <PokemonCardSkeleton key={i} />
        ))}
      </Box>
    );
  } else if (error) {
    content = (
      <StateMessage
        icon={<CloudOffIcon />}
        title={t('loadError')}
        description={t('loadErrorDesc')}
        action={
          <Box component="button" type="button" onClick={refetch} sx={primaryButtonSx}>
            <RefreshIcon />
            {t('retry')}
          </Box>
        }
      />
    );
  } else if (count === 0) {
    const emptyFavorites = favoritesOnly && favorites.length === 0;
    content = (
      <StateMessage
        icon={emptyFavorites ? <FavoriteBorderIcon /> : <SearchOffIcon />}
        title={emptyFavorites ? t('noFavoritesYet') : t('noPokemonFound')}
        description={emptyFavorites ? t('noFavoritesYetDesc') : t('noPokemonFoundDesc')}
        action={
          <Box component="button" type="button" onClick={clearFilters} sx={pillButtonSx}>
            {t('clearAllFilters')}
          </Box>
        }
      />
    );
  } else {
    content = (
      <Box sx={gridSx}>
        {filteredPokemons.map((pokemon, index) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} index={index} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={pageSx}>
      {/* Hero */}
      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.25fr) minmax(0, 0.9fr)' },
          alignItems: 'center',
          gap: { xs: 3, md: 6 },
          pt: { xs: 3.5, md: 7 },
          pb: { xs: 3, md: 6 },
        }}
      >
        <Box>
          <Typography
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              color: 'var(--accent)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              mb: 2,
              '&::before': { content: '""', width: 24, height: 2, borderRadius: 2, background: 'var(--accent)' },
            }}
          >
            {t('heroEyebrow')}
          </Typography>

          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.6rem' },
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              textWrap: 'balance',
            }}
          >
            {total > 0 ? (
              <>
                {t('heroTitleBefore')}{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(100deg, var(--accent) 10%, #ff9f5a 90%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t('heroTitleHighlight', { count: total })}
                </Box>{' '}
                {t('heroTitleAfter')}
              </>
            ) : (
              t('heroTitleFallback')
            )}
          </Typography>

          <Typography
            sx={{
              mt: 2.25,
              maxWidth: 560,
              color: 'var(--text-muted)',
              fontSize: { xs: '1rem', md: '1.1rem' },
              lineHeight: 1.6,
            }}
          >
            {t('heroSubtitle')}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 3, sm: 4.5 }, mt: 3.5 }}>
            <Box component="button" type="button" onClick={goToRandom} disabled={total === 0} sx={primaryButtonSx}>
              <CasinoIcon />
              {t('randomPokemon')}
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 4 }}>
              <HeroStat value={total || '—'} label={t('statPokemon')} />
              <HeroStat value={types.length} label={t('statTypes')} />
              <HeroStat value={favorites.length} label={t('statFavorites')} />
            </Box>
          </Box>
        </Box>

        {featured && <FeaturedPokemon pokemon={featured} />}
      </Box>

      <AdvancedSearch />

      {/* Compteur de résultats */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          minHeight: 36,
          mt: 3,
          mb: 2,
        }}
      >
        <Typography aria-live="polite" sx={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {!loading && !error && (
            <>
              <Box component="strong" sx={{ color: 'var(--text)', fontWeight: 700 }}>
                {t(count > 1 ? 'resultsMany' : 'resultsOne', { count })}
              </Box>
              {count !== total && ` ${t('resultsOf', { total })}`}
            </>
          )}
        </Typography>

        {hasActiveFilters && (
          <Box
            component="button"
            type="button"
            onClick={clearFilters}
            sx={{
              border: 0,
              background: 'none',
              p: '6px 10px',
              borderRadius: 999,
              color: 'var(--accent)',
              font: 'inherit',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { background: 'var(--accent-soft)' },
            }}
          >
            {t('resetAll')}
          </Box>
        )}
      </Box>

      {content}
    </Box>
  );
}
