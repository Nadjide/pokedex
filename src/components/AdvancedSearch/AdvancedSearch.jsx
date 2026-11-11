// src/components/AdvancedSearch/AdvancedSearch.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Box, ButtonBase, Divider, IconButton, InputBase, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SortIcon from '@mui/icons-material/Sort';
import CheckIcon from '@mui/icons-material/Check';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useFilter } from '../FilterShield/FilterContext.jsx';
import { useFavorites } from '../../FavoritesContext.jsx';
import { usePokemon } from '../../context/PokemonContext.jsx';
import { TypesContext } from '../../Page_1/TypesContext/TypesContext.jsx';
import { getReadableTextColor, getTypeColor, getTypeLabel } from '../../Theme/typeColors.js';
import { SORT_ORDERS } from '../../utils/filterPokemons.js';
import { useTranslation } from '../../i18n/translations.js';
import { toRoman } from '../../utils/pokemon.js';
import TypeIcon from '../TypeIcon.jsx';

const isTypingTarget = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const toolbarButtonSx = {
  height: 44,
  px: { xs: 1.25, md: 1.75 },
  gap: 0.75,
  borderRadius: 999,
  color: 'var(--text-muted)',
  fontFamily: 'inherit',
  fontSize: '0.86rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  flexShrink: 0,
  transition: 'background 0.2s ease, color 0.2s ease',
  '&:hover': { background: 'var(--surface-2)', color: 'var(--text)' },
  '& svg': { fontSize: 20 },
};

const typeChipSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  height: 38,
  pl: '5px',
  pr: '14px',
  flexShrink: 0,
  borderRadius: 999,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text-muted)',
  font: 'inherit',
  fontSize: '0.83rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
  '& .type-dot': {
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: 'var(--type)',
    color: 'var(--type-text)',
    transition: 'background 0.2s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    borderColor: 'var(--type)',
    color: 'var(--text)',
  },
  '&[aria-pressed="true"]': {
    background: 'var(--type)',
    borderColor: 'var(--type)',
    color: 'var(--type-text)',
    boxShadow: '0 8px 20px -8px var(--type)',
  },
  '&[aria-pressed="true"] .type-dot': {
    background: 'color-mix(in srgb, var(--type-text) 16%, transparent)',
  },
};

const chipRowSx = {
  display: 'flex',
  gap: 1,
  py: 0.5,
  flexWrap: { xs: 'nowrap', md: 'wrap' },
  overflowX: { xs: 'auto', md: 'visible' },
  mx: { xs: -2, md: 0 },
  px: { xs: 2, md: 0 },
};

const AdvancedSearch = () => {
  const {
    types,
    activeTypeFilters,
    toggleTypeFilter,
    generations,
    activeGenerationFilters,
    toggleGenerationFilter,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    favoritesOnly,
    setFavoritesOnly,
  } = useFilter();
  const { favorites } = useFavorites();
  const { pokemons } = usePokemon();
  // Seules les générations réellement chargées sont proposées (une seule en
  // mode dégradé : le filtre n'a alors pas lieu d'être).
  const availableGenerations = useMemo(() => {
    const present = new Set(pokemons.map((pokemon) => pokemon.generation));
    return generations.filter((generation) => present.has(generation));
  }, [pokemons, generations]);
  const { t, language } = useTranslation();
  const typesData = useContext(TypesContext) || {};
  const inputRef = useRef(null);
  const [sortAnchor, setSortAnchor] = useState(null);

  // Raccourci « / » : place le curseur dans la recherche depuis n'importe où.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (searchTerm) setSearchTerm('');
      else event.currentTarget.blur();
    }
  };

  return (
    <>
      {/* Barre de recherche flottante : reste accessible pendant le défilement.
          Elle doit rester enfant direct de la page pour coller sur toute sa hauteur. */}
      <Box sx={{ position: 'sticky', top: 'calc(var(--header-h) + 12px)', zIndex: 30 }}>
        <Box
          role="search"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.25, sm: 0.5 },
            height: 60,
            pl: { xs: 2, sm: 2.5 },
            pr: 1,
            borderRadius: 999,
            background: 'color-mix(in srgb, var(--surface) 86%, transparent)',
            backdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid var(--border-strong)',
            boxShadow: 'var(--shadow-md)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            '&:focus-within': {
              borderColor: 'var(--accent)',
              boxShadow: '0 0 0 4px var(--accent-soft), var(--shadow-md)',
            },
          }}
        >
          <SearchIcon sx={{ color: 'var(--text-faint)', mr: 1, flexShrink: 0 }} />
          <InputBase
            inputRef={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t('searchPlaceholder')}
            inputProps={{
              'aria-label': t('searchLabel'),
              autoComplete: 'off',
              spellCheck: false,
              enterKeyHint: 'search',
            }}
            sx={{
              flex: 1,
              minWidth: 0,
              color: 'var(--text)',
              fontSize: '1rem',
              '& input': { p: 0, textOverflow: 'ellipsis', outline: 'none' },
              '& input::placeholder': { color: 'var(--text-faint)', opacity: 1 },
            }}
          />

          {searchTerm ? (
            <Tooltip title={t('clearSearch')}>
              <IconButton
                size="small"
                onClick={() => {
                  setSearchTerm('');
                  inputRef.current?.focus();
                }}
                aria-label={t('clearSearch')}
                sx={{ color: 'var(--text-muted)', '&:hover': { color: 'var(--text)' } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={t('searchShortcut')}>
              <Box
                component="kbd"
                sx={{
                  display: { xs: 'none', sm: 'inline-grid' },
                  placeItems: 'center',
                  minWidth: 26,
                  height: 26,
                  borderRadius: '8px',
                  border: '1px solid var(--border-strong)',
                  background: 'var(--surface-2)',
                  color: 'var(--text-muted)',
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                /
              </Box>
            </Tooltip>
          )}

          <Divider orientation="vertical" flexItem sx={{ my: 1.75, mx: { xs: 0.5, sm: 1 }, borderColor: 'var(--border)' }} />

          <ButtonBase
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            aria-pressed={favoritesOnly}
            aria-label={t('favoritesOnly')}
            sx={{
              ...toolbarButtonSx,
              ...(favoritesOnly && {
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                '&:hover': { background: 'var(--accent-soft)', color: 'var(--accent)' },
              }),
            }}
          >
            {favoritesOnly ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
              {t('favorites')}
            </Box>
            <Box
              component="span"
              sx={{
                display: { xs: 'none', md: 'inline-grid' },
                placeItems: 'center',
                minWidth: 22,
                height: 22,
                px: '6px',
                borderRadius: 999,
                background: favoritesOnly ? 'var(--accent)' : 'var(--surface-3)',
                color: favoritesOnly ? '#fff' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {favorites.length}
            </Box>
          </ButtonBase>

          <ButtonBase
            onClick={(e) => setSortAnchor(e.currentTarget)}
            aria-haspopup="menu"
            aria-expanded={Boolean(sortAnchor)}
            aria-label={`${t('sortBy')} : ${t(`sortOptions.${sortOrder}`)}`}
            sx={toolbarButtonSx}
          >
            <SortIcon />
            <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
              {t(`sortOptions.${sortOrder}`)}
            </Box>
            <KeyboardArrowDownIcon sx={{ display: { xs: 'none', md: 'block' }, ml: -0.5 }} />
          </ButtonBase>

          <Menu
            anchorEl={sortAnchor}
            open={Boolean(sortAnchor)}
            onClose={() => setSortAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {SORT_ORDERS.map((order) => (
              <MenuItem
                key={order}
                selected={order === sortOrder}
                onClick={() => {
                  setSortOrder(order);
                  setSortAnchor(null);
                }}
              >
                <ListItemIcon sx={{ minWidth: '30px !important' }}>
                  {order === sortOrder && <CheckIcon fontSize="small" color="primary" />}
                </ListItemIcon>
                {t(`sortOptions.${order}`)}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* Filtres par génération (cumulables) */}
      {availableGenerations.length > 1 && (
        <Box
          role="group"
          aria-label={t('filterByGeneration')}
          className="no-scrollbar"
          style={{ '--type': 'var(--accent)', '--type-text': '#ffffff' }}
          sx={{ ...chipRowSx, mt: 2 }}
        >
          {availableGenerations.map((generation) => {
            const roman = toRoman(generation);
            return (
              <Box
                key={generation}
                component="button"
                type="button"
                onClick={() => toggleGenerationFilter(generation)}
                aria-pressed={activeGenerationFilters.includes(generation)}
                aria-label={`${t('generation', { roman })} · ${t(`regions.${generation}`)}`}
                sx={typeChipSx}
              >
                <Box
                  component="span"
                  className="type-dot"
                  sx={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, lineHeight: 1 }}
                >
                  {roman}
                </Box>
                {t(`regions.${generation}`)}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Filtres par type : défilement horizontal sur mobile, retour à la ligne au-delà */}
      <Box
        role="group"
        aria-label={`${t('filterByTypes')} (${t('filterByTypesHint')})`}
        className="no-scrollbar"
        sx={{ ...chipRowSx, mt: availableGenerations.length > 1 ? 0.75 : 2 }}
      >
        {types.map((type) => {
          const color = getTypeColor(type);
          return (
            <Box
              key={type}
              component="button"
              type="button"
              onClick={() => toggleTypeFilter(type)}
              aria-pressed={activeTypeFilters.includes(type)}
              style={{ '--type': color, '--type-text': getReadableTextColor(color) }}
              sx={typeChipSx}
            >
              <span className="type-dot">
                <TypeIcon type={type} sx={{ fontSize: 16 }} />
              </span>
              {getTypeLabel(type, language, typesData)}
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default AdvancedSearch;
