import React, { useMemo, useState } from 'react';
import { Box, InputBase, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SectionCard, { mutedTextSx } from './SectionCard.jsx';
import { useTranslation } from '../../i18n/translations.js';
import { formatSlug, normalizeText } from '../../utils/pokemon.js';

const INITIAL_COUNT = 24;

export default function MovesCard({ moves = [], sx }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const labels = useMemo(() => moves.map(formatSlug).sort((a, b) => a.localeCompare(b)), [moves]);

  const term = normalizeText(query);
  const filtered = term ? labels.filter((label) => normalizeText(label).includes(term)) : labels;
  const visible = expanded || term ? filtered : filtered.slice(0, INITIAL_COUNT);
  const canToggle = !term && labels.length > INITIAL_COUNT;

  return (
    <SectionCard
      title={`${t('moves')} (${labels.length})`}
      hint={t('movesNote')}
      sx={sx}
      action={
        labels.length > 8 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              height: 40,
              px: 1.75,
              width: { xs: '100%', sm: 240 },
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              transition: 'border-color 0.2s ease',
              '&:focus-within': { borderColor: 'var(--accent)' },
            }}
          >
            <SearchIcon sx={{ fontSize: 18, color: 'var(--text-faint)' }} />
            <InputBase
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('filterMoves')}
              inputProps={{ 'aria-label': t('filterMoves'), autoComplete: 'off', spellCheck: false }}
              sx={{
                flex: 1,
                color: 'var(--text)',
                fontSize: '0.88rem',
                '& input': { p: 0, outline: 'none' },
                '& input::placeholder': { color: 'var(--text-faint)', opacity: 1 },
              }}
            />
          </Box>
        )
      }
    >
      {visible.length === 0 ? (
        <Typography sx={mutedTextSx}>{t('noMoveFound')}</Typography>
      ) : (
        <Box component="ul" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, m: 0, p: 0, listStyle: 'none' }}>
          {visible.map((label) => (
            <Box
              component="li"
              key={label}
              sx={{
                px: 1.5,
                py: '6px',
                borderRadius: 999,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--text)',
                fontSize: '0.82rem',
                fontWeight: 500,
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
      )}

      {canToggle && (
        <Box
          component="button"
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          sx={{
            mt: 2.5,
            border: 0,
            background: 'none',
            p: '6px 10px',
            ml: '-10px',
            borderRadius: 999,
            color: 'var(--accent)',
            font: 'inherit',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { background: 'var(--accent-soft)' },
          }}
        >
          {expanded ? t('showLessMoves') : t('showAllMoves', { count: labels.length })}
        </Box>
      )}
    </SectionCard>
  );
}
