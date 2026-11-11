import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckIcon from '@mui/icons-material/Check';
import { useTeam } from '../TeamContext.jsx';
import { useTranslation } from '../i18n/translations.js';
import { pillButtonSx } from './FavoriteButton.jsx';

// Ajoute ou retire un Pokémon de l'équipe. Quand l'équipe est complète, le
// bouton reste atteignable au clavier (aria-disabled) pour que son explication
// soit lue, mais il n'agit plus.
export default function TeamButton({ pokemonId, variant = 'pill', className, sx }) {
  const { team, isInTeam, isFull, toggleTeamMember, maxSize } = useTeam();
  const { t } = useTranslation();

  const active = isInTeam(pokemonId);
  const blocked = isFull && !active;
  const fullLabel = t('team.full', { count: team.length, max: maxSize });

  const label = blocked ? fullLabel : active ? t('team.remove') : t('team.add');
  const tooltip = blocked ? `${fullLabel} — ${t('team.fullHint')}` : label;
  const icon = blocked ? <GroupsIcon /> : active ? <CheckIcon /> : <GroupAddIcon />;

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!blocked) toggleTeamMember(pokemonId);
  };

  if (variant === 'icon') {
    return (
      <Tooltip title={tooltip} placement="left">
        <IconButton
          onClick={handleClick}
          aria-label={tooltip}
          aria-pressed={active}
          aria-disabled={blocked || undefined}
          disableRipple={blocked}
          size="small"
          className={className}
          sx={{
            width: 34,
            height: 34,
            color: active ? 'var(--team-contrast)' : 'var(--text-muted)',
            background: active ? 'var(--team)' : 'color-mix(in srgb, var(--surface) 72%, transparent)',
            backdropFilter: 'blur(6px)',
            border: '1px solid',
            borderColor: active ? 'var(--team)' : 'var(--border)',
            transition: 'color 0.2s ease, background 0.2s ease, transform 0.2s ease, opacity 0.2s ease',
            '&:hover': {
              color: active ? 'var(--team-contrast)' : 'var(--team)',
              background: active ? 'var(--team)' : 'var(--surface)',
              transform: 'scale(1.08)',
            },
            '&[aria-disabled="true"]': { color: 'var(--text-faint)', cursor: 'not-allowed' },
            '&[aria-disabled="true"]:hover': {
              color: 'var(--text-faint)',
              background: 'color-mix(in srgb, var(--surface) 72%, transparent)',
              transform: 'none',
            },
            '& svg': { fontSize: 18 },
            ...sx,
          }}
        >
          {icon}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={blocked ? t('team.fullHint') : ''}>
      <Box
        component="button"
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        aria-disabled={blocked || undefined}
        aria-label={blocked ? tooltip : undefined}
        className={className}
        sx={{
          ...pillButtonSx,
          ...(active && {
            background: 'var(--team)',
            borderColor: 'var(--team)',
            color: 'var(--team-contrast)',
            '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--team)' },
          }),
          ...(blocked && {
            color: 'var(--text-muted)',
            borderStyle: 'dashed',
            cursor: 'not-allowed',
            '&:hover': { transform: 'none' },
          }),
          ...sx,
        }}
      >
        {icon}
        {blocked ? fullLabel : active ? t('team.inTeam') : t('team.add')}
      </Box>
    </Tooltip>
  );
}
