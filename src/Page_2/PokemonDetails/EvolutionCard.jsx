import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import EastIcon from '@mui/icons-material/East';
import SectionCard, { mutedTextSx } from './SectionCard.jsx';
import PokemonArtwork from '../../components/PokemonArtwork.jsx';
import { Shimmer } from '../../Page_1/PokemonCard/PokemonCardSkeleton.jsx';
import { flattenEvolutionStages } from '../../api/pokeapi.js';
import { usePokemon } from '../../context/PokemonContext.jsx';
import { useTranslation } from '../../i18n/translations.js';
import { getTypeColor } from '../../Theme/typeColors.js';
import { formatId, formatSlug, getPokemonName } from '../../utils/pokemon.js';

const describeCondition = (condition, t) => {
  if (!condition) return null;
  if (condition.item) {
    const key = `evo.items.${condition.item}`;
    const label = t(key);
    return label === key ? formatSlug(condition.item) : label;
  }
  if (condition.trigger === 'trade') return t('evo.trade');
  if (condition.minLevel) return t('evo.level', { level: condition.minLevel });
  if (condition.minHappiness) return t('evo.friendship');
  return t('evo.special');
};

function EvolutionNode({ pokemon, condition, isCurrent }) {
  const { t, language } = useTranslation();
  const name = getPokemonName(pokemon, language);
  const conditionLabel = describeCondition(condition, t);

  return (
    <Box
      component={Link}
      to={`/pokemon/${pokemon.id}`}
      aria-current={isCurrent ? 'page' : undefined}
      style={{ '--node-type': getTypeColor(pokemon.types?.[0]) }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        width: { xs: 104, sm: 148 },
        p: { xs: 1, sm: 1.5 },
        borderRadius: 'var(--radius-md)',
        border: '1px solid transparent',
        textDecoration: 'none',
        color: 'var(--text)',
        transition: 'transform 0.3s ease, background 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          background: 'color-mix(in srgb, var(--node-type) 12%, var(--surface-2))',
          borderColor: 'color-mix(in srgb, var(--node-type) 40%, transparent)',
        },
        '&[aria-current="page"]': {
          background: 'color-mix(in srgb, var(--node-type) 16%, var(--surface-2))',
          borderColor: 'color-mix(in srgb, var(--node-type) 55%, transparent)',
        },
      }}
    >
      <Box
        sx={{
          minHeight: 24,
          mb: 0.75,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {conditionLabel && (
          <Box
            component="span"
            sx={{
              px: 1.1,
              py: '3px',
              borderRadius: 999,
              background: 'var(--surface-3)',
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {conditionLabel}
          </Box>
        )}
      </Box>
      <PokemonArtwork pokemon={pokemon} alt="" sx={{ width: { xs: 76, sm: 108 } }} />
      <Typography
        sx={{
          mt: 1,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: { xs: '0.86rem', sm: '0.98rem' },
          textAlign: 'center',
          textTransform: 'capitalize',
          lineHeight: 1.2,
        }}
      >
        {name}
      </Typography>
      <Typography sx={{ color: 'var(--text-faint)', fontSize: '0.74rem', fontVariantNumeric: 'tabular-nums' }}>
        {formatId(pokemon.id)}
      </Typography>
    </Box>
  );
}

// `evolution` : undefined = chargement, null = indisponible, sinon l'arbre PokéAPI.
export default function EvolutionCard({ pokemon, evolution, sx }) {
  const { t } = useTranslation();
  const { getPokemonById } = usePokemon();

  const stages = useMemo(
    () => (evolution ? flattenEvolutionStages(evolution, (id) => Boolean(getPokemonById(id))) : []),
    [evolution, getPokemonById]
  );

  let body;
  if (evolution === undefined) {
    body = (
      <Box aria-busy="true" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
        {[0, 1, 2].map((i) => (
          <Shimmer key={i} sx={{ width: { xs: 76, sm: 108 }, aspectRatio: '1 / 1', borderRadius: '50%' }} />
        ))}
      </Box>
    );
  } else if (evolution === null) {
    body = <Typography sx={mutedTextSx}>{t('detailsUnavailableDesc')}</Typography>;
  } else if (stages.length <= 1) {
    body = <Typography sx={mutedTextSx}>{t('noEvolution')}</Typography>;
  } else {
    body = (
      <Box
        className="no-scrollbar"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.5, sm: 2 },
          overflowX: 'auto',
          mx: { xs: -1, sm: 0 },
          px: { xs: 1, sm: 0 },
          py: 0.5,
          // `safe` : si la chaîne dépasse, on garde le début accessible au défilement.
          justifyContent: 'safe center',
        }}
      >
        {stages.map((stage, stageIndex) => (
          <React.Fragment key={stage.map((entry) => entry.id).join('-')}>
            {stageIndex > 0 && (
              <EastIcon aria-hidden="true" sx={{ flexShrink: 0, color: 'var(--text-faint)', fontSize: { xs: 18, sm: 24 } }} />
            )}
            <Box sx={{ display: 'flex', alignItems: 'stretch', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
              {stage.map((entry) => (
                <EvolutionNode
                  key={entry.id}
                  pokemon={getPokemonById(entry.id)}
                  condition={entry.condition}
                  isCurrent={entry.id === pokemon.id}
                />
              ))}
            </Box>
          </React.Fragment>
        ))}
      </Box>
    );
  }

  return (
    <SectionCard title={t('evolutions')} sx={sx}>
      {body}
    </SectionCard>
  );
}
