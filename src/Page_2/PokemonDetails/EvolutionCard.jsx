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
import { describeEvolutionCondition } from '../../utils/evolution.js';
import { formatId, getPokemonName } from '../../utils/pokemon.js';

function EvolutionNode({ pokemon, condition, isCurrent }) {
  const { t, language } = useTranslation();
  const { getPokemonById } = usePokemon();
  const name = getPokemonName(pokemon, language);
  const conditionLabels = describeEvolutionCondition(condition, {
    t,
    language,
    getSpeciesName: (id) => {
      const species = getPokemonById(id);
      return species ? getPokemonName(species, language) : null;
    },
  });

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
      {/* Les conditions poussent l'illustration vers le bas : les Pokémon d'une
          même étape restent alignés, quel que soit le nombre de conditions. */}
      <Box
        sx={{
          flex: '1 0 auto',
          minHeight: 24,
          mb: 0.75,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          alignContent: 'flex-end',
          justifyContent: 'center',
          gap: '4px',
        }}
      >
        {conditionLabels.map((label) => (
          <Box
            component="span"
            key={label}
            sx={{
              maxWidth: '100%',
              px: 1.1,
              py: '3px',
              borderRadius: '12px',
              background: 'var(--surface-3)',
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: 600,
              lineHeight: 1.3,
              textAlign: 'center',
              overflowWrap: 'anywhere',
            }}
          >
            {label}
          </Box>
        ))}
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

  // Avec le Pokédex complet, toute la chaîne est connue. Le filtre ne joue qu'en
  // mode dégradé (liste limitée à Kanto), où l'on ne peut ni nommer ni ouvrir
  // les Pokémon des autres générations.
  const stages = useMemo(
    () => (evolution ? flattenEvolutionStages(evolution, (id) => Boolean(getPokemonById(id))) : []),
    [evolution, getPokemonById]
  );
  const chainSize = useMemo(() => (evolution ? flattenEvolutionStages(evolution).flat().length : 0), [evolution]);
  const shownSize = stages.flat().length;

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
    body = (
      <Typography sx={mutedTextSx}>{t(shownSize < chainSize ? 'evolutionOutsideList' : 'noEvolution')}</Typography>
    );
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
            {/* Étapes très ramifiées (Évoli) : plusieurs lignes plutôt qu'un long ruban. */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: `repeat(${Math.min(stage.length, 2)}, auto)`,
                  sm: `repeat(${Math.min(stage.length, 4)}, auto)`,
                },
                alignItems: 'stretch',
                gap: { xs: 0.5, sm: 1 },
                flexShrink: 0,
              }}
            >
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
