import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import SectionCard from './SectionCard.jsx';
import TypeBadge from '../../components/TypeBadge.jsx';
import { getDefenseProfile } from '../../data/typeChart.js';
import { useTranslation } from '../../i18n/translations.js';

function DefenseGroup({ label, entries, emptyLabel }) {
  return (
    <Box sx={{ '& + &': { mt: 2.25, pt: 2.25, borderTop: '1px solid var(--border)' } }}>
      <Typography
        component="h3"
        sx={{
          mb: 1.25,
          color: 'var(--text-muted)',
          fontSize: '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      {entries.length === 0 ? (
        <Typography sx={{ color: 'var(--text-faint)', fontSize: '0.9rem' }}>{emptyLabel}</Typography>
      ) : (
        <Box component="ul" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, m: 0, p: 0, listStyle: 'none' }}>
          {entries.map(({ type, multiplier }) => (
            <li key={type}>
              <TypeBadge type={type} multiplier={multiplier} />
            </li>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default function DefensesCard({ types, sx }) {
  const { t } = useTranslation();
  const profile = useMemo(() => getDefenseProfile(types), [types]);

  return (
    <SectionCard title={t('typeDefenses')} hint={t('typeDefensesHint')} sx={sx}>
      <DefenseGroup label={t('weaknesses')} entries={profile.weaknesses} emptyLabel={t('none')} />
      <DefenseGroup label={t('resistances')} entries={profile.resistances} emptyLabel={t('none')} />
      <DefenseGroup label={t('immunities')} entries={profile.immunities} emptyLabel={t('none')} />
    </SectionCard>
  );
}
