import React, { memo } from 'react';
import { Box, Tooltip } from '@mui/material';
import TypeBadge from '../../components/TypeBadge.jsx';
import MoveCategoryIcon from '../../components/MoveCategoryIcon.jsx';
import { Shimmer } from '../../Page_1/PokemonCard/PokemonCardSkeleton.jsx';
import { useTranslation } from '../../i18n/translations.js';
import { getMoveDescription, getMoveName } from '../../utils/moves.js';

const srOnlySx = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

// Une ligne sur écran large ; sur mobile, le nom et le type puis les valeurs.
const rowSx = {
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: 'minmax(0, 1fr) 96px auto' },
  alignItems: 'center',
  columnGap: 1.5,
  rowGap: '6px',
  minHeight: 46,
  px: 1,
  py: { xs: 1.1, sm: 0.75 },
  borderBottom: '1px solid var(--border)',
  breakInside: 'avoid',
  outlineOffset: '-2px',
  transition: 'background 0.15s ease',
};

const nameSx = {
  minWidth: 0,
  fontSize: '0.92rem',
  fontWeight: 600,
  overflowWrap: 'anywhere',
};

const metaSx = {
  gridColumn: { xs: '1 / -1', sm: 'auto' },
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 1.75, sm: 1.25 },
  color: 'var(--text-muted)',
  fontSize: '0.8rem',
};

const categorySx = (theme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  [theme.breakpoints.up('sm')]: { width: 20, justifyContent: 'center', '& .category-label': srOnlySx },
});

const statSx = {
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: '5px',
  justifyContent: { sm: 'flex-end' },
};

const statValueSx = {
  color: 'var(--text)',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '0.92rem',
  fontVariantNumeric: 'tabular-nums',
};

function Stat({ label, short, value, emptyLabel, width }) {
  return (
    <Box component="span" sx={{ ...statSx, minWidth: { sm: width } }}>
      <Box component="span" aria-hidden="true" sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
        {short}
      </Box>
      <Box component="span" sx={srOnlySx}>
        {label}
      </Box>
      {value === null ? (
        <>
          <Box component="span" aria-hidden="true" sx={{ ...statValueSx, color: 'var(--text-faint)' }}>
            —
          </Box>
          <Box component="span" sx={srOnlySx}>
            {emptyLabel}
          </Box>
        </>
      ) : (
        <Box component="span" sx={statValueSx}>
          {value}
        </Box>
      )}
    </Box>
  );
}

export function MoveRowSkeleton({ index = 0 }) {
  return (
    <Box component="li" aria-hidden="true" sx={rowSx}>
      <Shimmer sx={{ height: 14, width: `${48 + ((index * 17) % 36)}%` }} />
      <Shimmer sx={{ height: 22, width: 76, borderRadius: 999 }} />
      <Shimmer sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' }, height: 14, width: { xs: '60%', sm: 168 } }} />
    </Box>
  );
}

// `move` : null quand PokéAPI n'a pas répondu — seul le nom anglais du jeu de
// données est alors affiché, sans valeurs.
function MoveRow({ slug, move }) {
  const { t, language } = useTranslation();
  const name = getMoveName({ slug, move }, language);

  if (!move) {
    return (
      <Box component="li" sx={rowSx}>
        <Box component="span" lang="en" sx={nameSx}>
          {name}
        </Box>
        <Box component="span" sx={{ gridColumn: '2 / -1', color: 'var(--text-faint)', fontSize: '0.8rem' }}>
          {t('unavailable')}
        </Box>
      </Box>
    );
  }

  const description = getMoveDescription(move, language);
  const categoryLabel = move.category ? t(`moveCategories.${move.category}`) : null;
  const tooltipHead = [categoryLabel, move.pp === null ? null : t('movePP', { value: move.pp })]
    .filter(Boolean)
    .join(' · ');

  const tooltip =
    tooltipHead || description ? (
      <Box sx={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
        {tooltipHead && <Box sx={{ fontWeight: 700 }}>{tooltipHead}</Box>}
        {description && (
          <Box lang={move.description[language] ? undefined : 'en'} sx={{ mt: tooltipHead ? 0.5 : 0, fontWeight: 400 }}>
            {description}
          </Box>
        )}
      </Box>
    ) : (
      ''
    );

  return (
    <Tooltip
      describeChild
      disableInteractive
      title={tooltip}
      placement="top"
      enterTouchDelay={0}
      leaveTouchDelay={4000}
    >
      <Box
        component="li"
        tabIndex={tooltip ? 0 : undefined}
        sx={{ ...rowSx, '&:hover, &:focus-visible': { background: 'var(--surface-2)' } }}
      >
        <Box component="span" lang={move.names[language] ? undefined : 'en'} sx={nameSx}>
          {name}
        </Box>
        <Box component="span" sx={{ display: 'inline-flex' }}>
          <TypeBadge type={move.type} size="sm" />
        </Box>
        <Box component="span" sx={metaSx}>
          {move.category && (
            <Box component="span" sx={categorySx}>
              <MoveCategoryIcon category={move.category} />
              <span className="category-label">{categoryLabel}</span>
            </Box>
          )}
          <Stat
            label={t('movePower')}
            short={t('movePowerShort')}
            value={move.power}
            emptyLabel={t('none')}
            width={66}
          />
          <Stat
            label={t('moveAccuracy')}
            short={t('moveAccuracyShort')}
            value={move.accuracy === null ? null : t('movePercent', { value: move.accuracy })}
            emptyLabel={t('none')}
            width={86}
          />
        </Box>
      </Box>
    </Tooltip>
  );
}

export default memo(MoveRow);
