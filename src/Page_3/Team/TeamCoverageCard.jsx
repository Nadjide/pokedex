import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SectionCard, { mutedTextSx } from '../../Page_2/PokemonDetails/SectionCard.jsx';
import TypeBadge from '../../components/TypeBadge.jsx';
import { formatMultiplier } from '../../data/typeChart.js';
import { useTranslation } from '../../i18n/translations.js';
import { getPokemonName } from '../../utils/pokemon.js';
import { SHARED_WEAKNESS_THRESHOLD, analyzeTeamDefense } from '../../utils/team.js';

export const visuallyHiddenSx = {
  position: 'absolute',
  // En `sx`, un nombre ≤ 1 vaut un pourcentage : les unités sont nécessaires.
  width: '1px',
  height: '1px',
  m: '-1px',
  p: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const TONES = {
  weak: 'var(--weak)',
  resist: 'var(--resist)',
  immune: 'var(--compare)',
  warn: 'var(--star)',
};

const subtitleSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '0.98rem',
  lineHeight: 1.25,
};

// Encadré de synthèse : types à surveiller, ou message rassurant s'il n'y en a pas.
function Highlight({ tone, title, hint, rows, emptyLabel, renderExtra }) {
  const alert = rows.length > 0;
  const color = alert ? TONES[tone] : TONES.resist;

  return (
    <Box
      sx={{
        minWidth: 0,
        p: { xs: 1.75, md: 2.25 },
        borderRadius: 'var(--radius-md)',
        background: `color-mix(in srgb, ${color} 9%, var(--surface))`,
        border: `1px solid color-mix(in srgb, ${color} 42%, var(--border))`,
      }}
    >
      <Typography component="h3" sx={subtitleSx}>
        {alert ? (
          <WarningAmberIcon sx={{ fontSize: 19, color }} />
        ) : (
          <CheckCircleOutlineIcon sx={{ fontSize: 19, color }} />
        )}
        {title}
        {alert && (
          <Box
            component="span"
            sx={{ ml: 'auto', color: 'var(--text-muted)', fontSize: '0.86rem', fontVariantNumeric: 'tabular-nums' }}
          >
            {rows.length}
          </Box>
        )}
      </Typography>
      <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.8rem', mt: 0.4, mb: 1.4 }}>{hint}</Typography>

      {alert ? (
        <Box component="ul" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, m: 0, p: 0, listStyle: 'none' }}>
          {rows.map((row) => (
            <Box component="li" key={row.type} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
              <TypeBadge type={row.type} />
              {renderExtra?.(row)}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography sx={{ fontSize: '0.9rem' }}>{emptyLabel}</Typography>
      )}
    </Box>
  );
}

// Nombre de membres concernés, avec leurs noms sur grand écran.
function CountCell({ entries, tone, names, flag, flagLabel }) {
  const count = entries.length;
  const color = TONES[flag === 'unresisted' ? 'warn' : tone];
  const solid = flag === 'shared';

  return (
    <Box
      component="td"
      sx={{ py: '7px', px: { xs: 0.5, md: 1 }, verticalAlign: 'middle', textAlign: { xs: 'center', md: 'left' } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1 }}>
        <Box
          component="span"
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            minWidth: 30,
            height: 26,
            px: '8px',
            borderRadius: 999,
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.92rem',
            fontVariantNumeric: 'tabular-nums',
            border: '1px solid transparent',
            color: 'var(--text-faint)',
            ...(count > 0 && {
              color: 'var(--text)',
              background: `color-mix(in srgb, ${color} 18%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
            }),
            ...(solid && { color: 'var(--weak-contrast)', background: color, borderColor: color }),
            ...(flag === 'unresisted' && {
              color: 'var(--text)',
              borderStyle: 'dashed',
              borderColor: color,
            }),
          }}
        >
          {solid && <WarningAmberIcon sx={{ fontSize: 14 }} />}
          {count}
        </Box>
        {flag && <Box component="span" sx={visuallyHiddenSx}>{`(${flagLabel})`}</Box>}
        {count > 0 && (
          <Box
            component="span"
            sx={{
              display: { xs: 'none', md: 'inline' },
              minWidth: 0,
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              lineHeight: 1.3,
              textTransform: 'capitalize',
            }}
          >
            {entries
              .map(({ id, multiplier }) =>
                multiplier === 4 || multiplier === 0.25
                  ? `${names[id]} ${formatMultiplier(multiplier)}`
                  : names[id]
              )
              .join(', ')}
          </Box>
        )}
      </Box>
    </Box>
  );
}

const headCellSx = {
  py: 1,
  px: { xs: 0.5, md: 1 },
  textAlign: { xs: 'center', md: 'left' },
  color: 'var(--text-muted)',
  // Quatre colonnes doivent tenir sur un téléphone étroit.
  fontSize: { xs: '0.62rem', sm: '0.72rem' },
  fontWeight: 700,
  letterSpacing: { xs: '0.02em', sm: '0.08em' },
  textTransform: 'uppercase',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
};

// Analyse défensive de l'équipe : synthèse puis détail par type d'attaque.
export default function TeamCoverageCard({ members, sx }) {
  const { t, language } = useTranslation();
  const analysis = useMemo(() => analyzeTeamDefense(members), [members]);
  const names = useMemo(
    () => Object.fromEntries(members.map((pokemon) => [pokemon.id, getPokemonName(pokemon, language)])),
    [members, language]
  );

  if (members.length === 0) {
    return (
      <SectionCard title={t('team.coverage')} hint={t('team.coverageHint')} sx={sx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'var(--text-muted)' }}>
          <ShieldOutlinedIcon sx={{ color: 'var(--text-faint)' }} />
          <Typography sx={mutedTextSx}>{t('team.coverageEmpty')}</Typography>
        </Box>
      </SectionCard>
    );
  }

  const sharedTypes = new Set(analysis.sharedWeaknesses.map((row) => row.type));
  const unresistedTypes = new Set(analysis.unresisted.map((row) => row.type));
  const threshold = SHARED_WEAKNESS_THRESHOLD;

  return (
    <SectionCard title={t('team.coverage')} hint={t('team.coverageHint')} sx={sx}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Highlight
          tone="weak"
          title={t('team.sharedWeaknesses')}
          hint={t('team.sharedWeaknessesHint', { threshold })}
          rows={analysis.sharedWeaknesses}
          emptyLabel={t('team.noSharedWeakness', { threshold })}
          renderExtra={(row) => (
            <Box component="span" sx={{ fontSize: '0.84rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {t('team.membersCount', { count: row.weak.length })}
            </Box>
          )}
        />
        <Highlight
          tone="warn"
          title={t('team.unresisted')}
          hint={t('team.unresistedHint')}
          rows={analysis.unresisted}
          emptyLabel={t('team.allResisted')}
        />
      </Box>

      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', tableLayout: { md: 'fixed' } }}>
        <Box component="caption" sx={visuallyHiddenSx}>
          {t('team.coverageHint')}
        </Box>
        <Box component="colgroup" sx={{ display: { xs: 'none', md: 'table-column-group' } }}>
          <col style={{ width: '22%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '18%' }} />
        </Box>
        <thead>
          <tr>
            <Box component="th" scope="col" sx={{ ...headCellSx, textAlign: 'left', pl: 0 }}>
              {t('team.attackType')}
            </Box>
            <Box component="th" scope="col" sx={headCellSx}>
              {t('team.weak')}
            </Box>
            <Box component="th" scope="col" sx={headCellSx}>
              {t('team.resistant')}
            </Box>
            <Box component="th" scope="col" sx={headCellSx}>
              {t('team.immune')}
            </Box>
          </tr>
        </thead>
        <tbody>
          {analysis.rows.map((row) => {
            const shared = sharedTypes.has(row.type);
            const unresisted = unresistedTypes.has(row.type);

            return (
              <Box
                component="tr"
                key={row.type}
                sx={{
                  '& > *': { borderBottom: '1px solid var(--border)' },
                  '&:last-of-type > *': { borderBottom: 0 },
                  ...(shared && { background: 'color-mix(in srgb, var(--weak) 9%, transparent)' }),
                }}
              >
                <Box component="th" scope="row" sx={{ py: '7px', pr: { xs: 0.5, md: 1 }, textAlign: 'left', fontWeight: 'inherit' }}>
                  <TypeBadge type={row.type} size="md" sx={{ '& svg': { display: { xs: 'none', sm: 'block' } } }} />
                </Box>
                <CountCell
                  entries={row.weak}
                  tone="weak"
                  names={names}
                  flag={shared ? 'shared' : undefined}
                  flagLabel={t('team.sharedFlag')}
                />
                <CountCell
                  entries={row.resist}
                  tone="resist"
                  names={names}
                  flag={unresisted ? 'unresisted' : undefined}
                  flagLabel={t('team.unresistedFlag')}
                />
                <CountCell entries={row.immune} tone="immune" names={names} />
              </Box>
            );
          })}
        </tbody>
      </Box>
    </SectionCard>
  );
}
