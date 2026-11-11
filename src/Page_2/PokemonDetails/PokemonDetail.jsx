import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Rating, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarIcon from '@mui/icons-material/Star';
import { usePokemon } from '../../context/PokemonContext.jsx';
import { usePokemonDetails } from '../../hooks/usePokemonDetails.js';
import { useRating } from '../../hooks/useRating.js';
import { useTranslation } from '../../i18n/translations.js';
import { getTypeColor } from '../../Theme/typeColors.js';
import { formatHeight, formatId, formatSlug, formatWeight, getPokemonName } from '../../utils/pokemon.js';
import SimilarPokemon from '../SimilarPokemon/SimilarPokemon';
import CompareButton from '../../components/CompareButton.jsx';
import TeamButton from '../../components/TeamButton.jsx';
import FavoriteButton, { pillButtonSx } from '../../components/FavoriteButton.jsx';
import PokemonArtwork from '../../components/PokemonArtwork.jsx';
import PokeballMark from '../../components/PokeballMark.jsx';
import TypeBadge from '../../components/TypeBadge.jsx';
import { Shimmer } from '../../Page_1/PokemonCard/PokemonCardSkeleton.jsx';
import StatsCard from './StatsCard.jsx';
import DefensesCard from './DefensesCard.jsx';
import EvolutionCard from './EvolutionCard.jsx';
import MovesCard from './MovesCard.jsx';

const pageSx = {
  maxWidth: 1180,
  mx: 'auto',
  px: { xs: 2, md: 3 },
  pt: { xs: 2.5, md: 4 },
};

const heroSx = {
  position: 'relative',
  isolation: 'isolate',
  overflow: 'hidden',
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.1fr) minmax(0, 0.9fr)' },
  gridTemplateAreas: { xs: '"art" "text" "facts"', md: '"text art" "facts facts"' },
  alignItems: 'center',
  columnGap: 4,
  rowGap: { xs: 2.5, md: 4.5 },
  p: { xs: 2.5, sm: 4, md: 5.5 },
  borderRadius: 'var(--radius-xl)',
  background:
    'linear-gradient(135deg, color-mix(in srgb, var(--type) var(--hero-tint), var(--surface)) 0%, color-mix(in srgb, var(--type-2) 14%, var(--surface)) 100%)',
  border: '1px solid color-mix(in srgb, var(--type) 34%, var(--border))',
  boxShadow: 'var(--shadow-lg)',
};

const factSx = {
  minWidth: 0,
  p: { xs: 1.75, md: 2.25 },
  borderRadius: 'var(--radius-md)',
  background: 'color-mix(in srgb, var(--surface) 62%, transparent)',
  border: '1px solid var(--border)',
  backdropFilter: 'blur(12px)',
};

const factLabelSx = {
  mb: 0.75,
  color: 'var(--text-muted)',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

const factValueSx = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: { xs: '1.2rem', md: '1.4rem' },
  lineHeight: 1.2,
  fontVariantNumeric: 'tabular-nums',
};

const isTypingTarget = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

function NeighborLink({ pokemon, direction }) {
  const { t, language } = useTranslation();
  if (!pokemon) return null;

  const name = getPokemonName(pokemon, language);
  const label = direction === 'prev' ? t('previousPokemon') : t('nextPokemon');

  return (
    <Tooltip title={`${label} (${direction === 'prev' ? '←' : '→'})`}>
      <Box
        component={Link}
        to={`/pokemon/${pokemon.id}`}
        aria-label={`${label} : ${name}`}
        sx={{ ...pillButtonSx, gap: '4px', px: '12px', textDecoration: 'none' }}
      >
        {direction === 'prev' && <ChevronLeftIcon sx={{ ml: '-4px' }} />}
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, textTransform: 'capitalize' }}>
          {name}
        </Box>
        <Box component="span" sx={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {formatId(pokemon.id)}
        </Box>
        {direction === 'next' && <ChevronRightIcon sx={{ mr: '-4px' }} />}
      </Box>
    </Tooltip>
  );
}

function AbilityList({ details }) {
  const { t, language } = useTranslation();
  const abilities = details.abilities ?? details.core?.abilities ?? null;

  if (!abilities) {
    return details.loading ? (
      <Shimmer sx={{ height: 26, width: '75%' }} />
    ) : (
      <Typography sx={{ color: 'var(--text-faint)', fontSize: '0.95rem' }}>{t('unavailable')}</Typography>
    );
  }

  return (
    <Box component="ul" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, m: 0, p: 0, listStyle: 'none' }}>
      {abilities.map((ability) => {
        const name = ability.names?.[language] || ability.names?.en || formatSlug(ability.slug);
        const description = ability.description?.[language] || ability.description?.en || '';
        const tooltip = [ability.hidden ? t('hiddenAbility') : null, description].filter(Boolean).join(' — ');

        return (
          <Tooltip key={ability.slug} title={tooltip}>
            <Box
              component="li"
              tabIndex={tooltip ? 0 : undefined}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: '5px',
                borderRadius: 999,
                border: '1px solid',
                borderColor: 'var(--border-strong)',
                borderStyle: ability.hidden ? 'dashed' : 'solid',
                background: 'color-mix(in srgb, var(--surface) 70%, transparent)',
                fontSize: '0.86rem',
                fontWeight: 600,
              }}
            >
              {name}
              {ability.hidden && (
                <Box component="span" sx={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 500 }}>
                  {t('hiddenShort')}
                </Box>
              )}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

function DetailSkeleton() {
  return (
    <Box sx={pageSx} role="status" aria-busy="true">
      <Shimmer sx={{ width: 130, height: 42, borderRadius: 999, mb: 2.5 }} />
      <Shimmer sx={{ height: { xs: 560, md: 500 }, borderRadius: 'var(--radius-xl)' }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mt: 2.5 }}>
        <Shimmer sx={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
        <Shimmer sx={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
      </Box>
    </Box>
  );
}

export default function PokemonDetail() {
  const { t, language } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPokemonById, loading } = usePokemon();
  const [shiny, setShiny] = useState(false);

  const pokemon = getPokemonById(id);
  const details = usePokemonDetails(pokemon?.id);
  const [rating, setRating] = useRating(pokemon?.id ?? 0);

  const previous = pokemon ? getPokemonById(pokemon.id - 1) : null;
  const next = pokemon ? getPokemonById(pokemon.id + 1) : null;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Flèches ← / → : Pokémon précédent / suivant.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (isTypingTarget(event.target) || document.querySelector('.MuiModal-root')) return;
      if (event.key === 'ArrowLeft' && previous) navigate(`/pokemon/${previous.id}`);
      if (event.key === 'ArrowRight' && next) navigate(`/pokemon/${next.id}`);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previous, next, navigate]);

  if (loading) return <DetailSkeleton />;

  if (!pokemon) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', my: { xs: 8, md: 12 }, px: 3, textAlign: 'center' }}>
        <Typography component="h1" sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', mb: 1 }}>
          {t('pokemonNotFound')}
        </Typography>
        <Typography sx={{ color: 'var(--text-muted)', mb: 3.5 }}>{t('pokemonNotFoundDesc', { id })}</Typography>
        <Box component={Link} to="/" sx={{ ...pillButtonSx, textDecoration: 'none' }}>
          <ArrowBackIcon />
          {t('backToPokedex')}
        </Box>
      </Box>
    );
  }

  const types = pokemon.types?.length ? pokemon.types : ['normal'];
  const name = getPokemonName(pokemon, language);
  const genus = details.species?.genus?.[language] || details.species?.genus?.en;
  const flavor = details.species?.flavor?.[language] || details.species?.flavor?.en;
  const japaneseName = pokemon.names?.ja;
  const rarity = details.species?.isMythical ? t('mythical') : details.species?.isLegendary ? t('legendary') : null;
  const cryUrl = details.core?.cry;

  const playCry = () => {
    if (!cryUrl) return;
    try {
      const audio = new Audio(cryUrl);
      audio.volume = 0.35;
      audio.play().catch(() => {});
    } catch (e) {
      // Lecture audio indisponible : sans conséquence.
    }
  };

  return (
    <Box
      sx={pageSx}
      style={{ '--type': getTypeColor(types[0]), '--type-2': getTypeColor(types[1] || types[0]) }}
    >
      {/* Navigation */}
      <Box component="nav" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <Box component={Link} to="/" sx={{ ...pillButtonSx, textDecoration: 'none' }}>
          <ArrowBackIcon />
          {t('appTitle')}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <NeighborLink pokemon={previous} direction="prev" />
          <NeighborLink pokemon={next} direction="next" />
        </Box>
      </Box>

      {/* Hero */}
      <Box component="section" sx={heroSx}>
        {japaneseName && (
          <Box
            aria-hidden="true"
            lang="ja"
            sx={{
              position: 'absolute',
              top: { xs: 8, md: 4 },
              right: { xs: 12, md: 28 },
              zIndex: -1,
              fontWeight: 800,
              fontSize: { xs: '3.2rem', sm: '5rem', md: '6.5rem' },
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              color: 'color-mix(in srgb, var(--type) 26%, transparent)',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {japaneseName}
          </Box>
        )}

        <Box sx={{ gridArea: 'text', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
            <Typography
              sx={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.15rem',
                letterSpacing: '0.04em',
                color: 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatId(pokemon.id)}
            </Typography>
            {rarity && (
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  height: 24,
                  px: 1.1,
                  borderRadius: 999,
                  background: 'color-mix(in srgb, var(--star) 22%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--star) 55%, transparent)',
                  color: 'var(--text)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                <StarIcon sx={{ fontSize: 13, color: 'var(--star)' }} />
                {rarity}
              </Box>
            )}
          </Box>

          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: { xs: '2.5rem', sm: '3.3rem', md: '4rem' },
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              textTransform: 'capitalize',
              overflowWrap: 'anywhere',
            }}
          >
            {name}
          </Typography>

          <Box sx={{ minHeight: 26, mt: 0.75 }}>
            {genus ? (
              <Typography sx={{ color: 'var(--text-muted)', fontSize: '1.02rem', fontWeight: 500 }}>{genus}</Typography>
            ) : (
              details.loading && <Shimmer sx={{ width: 150, height: 18, mt: 0.5 }} />
            )}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {types.map((type) => (
              <TypeBadge key={type} type={type} size="lg" />
            ))}
          </Box>

          {flavor ? (
            <Typography sx={{ mt: 2.5, maxWidth: 540, fontSize: '1.02rem', lineHeight: 1.65, textWrap: 'pretty' }}>
              {flavor}
            </Typography>
          ) : (
            details.loading && (
              <Box sx={{ mt: 2.5, maxWidth: 540 }} aria-busy="true">
                <Shimmer sx={{ height: 14, mb: 1.25 }} />
                <Shimmer sx={{ height: 14, mb: 1.25, width: '92%' }} />
                <Shimmer sx={{ height: 14, width: '60%' }} />
              </Box>
            )
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mt: 3.5 }}>
            <FavoriteButton pokemonId={pokemon.id} variant="pill" />
            <CompareButton pokemon={pokemon} />
            <TeamButton pokemonId={pokemon.id} />
            <Box
              component="button"
              type="button"
              onClick={() => setShiny((prev) => !prev)}
              aria-pressed={shiny}
              aria-label={shiny ? t('showNormal') : t('showShiny')}
              sx={{
                ...pillButtonSx,
                ...(shiny && {
                  background: 'var(--star)',
                  borderColor: 'var(--star)',
                  color: '#15171f',
                  '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--star)' },
                }),
              }}
            >
              <AutoAwesomeIcon />
              {t('shiny')}
            </Box>
            <Tooltip title={t('playCry')}>
              <span>
                <Box
                  component="button"
                  type="button"
                  onClick={playCry}
                  disabled={!cryUrl}
                  aria-label={t('playCry')}
                  sx={{ ...pillButtonSx, width: 42, px: 0, justifyContent: 'center' }}
                >
                  <VolumeUpIcon />
                </Box>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Box
          sx={{
            gridArea: 'art',
            position: 'relative',
            display: 'grid',
            placeItems: 'center',
            minWidth: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '92%',
              maxWidth: 440,
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, color-mix(in srgb, var(--type) 60%, transparent) 0%, transparent 66%)',
              opacity: 0.6,
              zIndex: -1,
            },
          }}
        >
          <PokeballMark
            outline
            size={100}
            style={{
              position: 'absolute',
              width: 'min(88%, 400px)',
              height: 'auto',
              zIndex: -1,
              color: 'var(--type)',
              opacity: 0.1,
              animation: 'spin-slow 70s linear infinite',
            }}
          />
          <Box sx={{ width: { xs: '68%', sm: '52%', md: '88%' }, maxWidth: 380, animation: 'float-y 6s ease-in-out infinite' }}>
            <PokemonArtwork
              pokemon={pokemon}
              shiny={shiny}
              alt={name}
              loading="eager"
              sx={{ width: '100%', filter: 'drop-shadow(0 26px 28px rgba(0, 0, 0, 0.38))' }}
            />
          </Box>
        </Box>

        <Box
          component="dl"
          sx={{
            gridArea: 'facts',
            m: 0,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: '0.7fr 0.7fr 1.5fr 1.1fr' },
            gap: { xs: 1.25, md: 1.75 },
          }}
        >
          <Box sx={factSx}>
            <Typography component="dt" sx={factLabelSx}>
              {t('height')}
            </Typography>
            <Typography component="dd" sx={{ ...factValueSx, m: 0 }}>
              {formatHeight(pokemon.height, language)}
            </Typography>
          </Box>
          <Box sx={factSx}>
            <Typography component="dt" sx={factLabelSx}>
              {t('weight')}
            </Typography>
            <Typography component="dd" sx={{ ...factValueSx, m: 0 }}>
              {formatWeight(pokemon.weight, language)}
            </Typography>
          </Box>
          <Box sx={{ ...factSx, gridColumn: { xs: '1 / -1', md: 'auto' } }}>
            <Typography component="dt" sx={factLabelSx}>
              {t('abilities')}
            </Typography>
            <Box component="dd" sx={{ m: 0 }}>
              <AbilityList details={details} />
            </Box>
          </Box>
          <Box sx={{ ...factSx, gridColumn: { xs: '1 / -1', md: 'auto' } }}>
            <Typography component="dt" sx={factLabelSx} id="rating-label">
              {t('myRating')}
            </Typography>
            <Box component="dd" sx={{ m: 0, display: 'flex', alignItems: 'center', minHeight: 30 }}>
              <Rating
                name={`pokemon-rating-${pokemon.id}`}
                aria-labelledby="rating-label"
                value={rating}
                onChange={(event, value) => setRating(value || 0)}
                sx={{
                  fontSize: '1.7rem',
                  '& .MuiRating-iconFilled': { color: 'var(--star)' },
                  '& .MuiRating-iconHover': { color: 'var(--star)' },
                  '& .MuiRating-iconEmpty': { color: 'var(--text-faint)' },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {details.failed && (
        <Box
          role="alert"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            mt: 2.5,
            p: 2,
            pl: 2.5,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-soft)',
            border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 600 }}>{t('detailsUnavailable')}</Typography>
            <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t('detailsUnavailableDesc')}</Typography>
          </Box>
          <Box component="button" type="button" onClick={details.retry} sx={pillButtonSx}>
            <RefreshIcon />
            {t('retry')}
          </Box>
        </Box>
      )}

      {/* Sections */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 2.5,
          mt: 2.5,
        }}
      >
        <StatsCard loading={details.loading} stats={details.core?.stats} total={details.core?.total} />
        <DefensesCard types={types} />
        <EvolutionCard
          pokemon={pokemon}
          evolution={details.loading ? undefined : details.species ? details.evolution : null}
          sx={{ gridColumn: '1 / -1' }}
        />
        <MovesCard moves={pokemon.moves || []} sx={{ gridColumn: '1 / -1' }} />
      </Box>

      <SimilarPokemon pokemon={pokemon} />
    </Box>
  );
}
