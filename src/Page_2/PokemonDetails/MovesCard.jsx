import React, { useMemo, useRef, useState } from 'react';
import { Box, InputBase, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SectionCard, { mutedTextSx } from './SectionCard.jsx';
import MoveRow, { MoveRowSkeleton } from './MoveRow.jsx';
import TypeBadge from '../../components/TypeBadge.jsx';
import MoveCategoryIcon from '../../components/MoveCategoryIcon.jsx';
import { ALL_TYPES } from '../../data/typeChart.js';
import { useInView } from '../../hooks/useInView.js';
import { useMoveDetails } from '../../hooks/useMoveDetails.js';
import { usePokemonMoves } from '../../hooks/usePokemonMoves.js';
import { Shimmer } from '../../Page_1/PokemonCard/PokemonCardSkeleton.jsx';
import { useTranslation } from '../../i18n/translations.js';
import {
  MOVE_CATEGORIES,
  MOVE_SORTS,
  countMoveTypes,
  filterAndSortMoves,
  getLoadProgress,
} from '../../utils/moves.js';

const INITIAL_COUNT = 24;
const TOOLBAR_MIN_MOVES = 8;

const controlSx = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  height: 40,
  px: 1.5,
  flexShrink: 0,
  borderRadius: 999,
  border: '1px solid var(--border)',
  background: 'var(--surface-2)',
  color: 'var(--text-muted)',
  font: 'inherit',
  fontSize: '0.84rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, color 0.2s ease, background 0.2s ease',
  '&:hover': { borderColor: 'var(--border-strong)', color: 'var(--text)' },
  '&[aria-pressed="true"], &[data-active="true"]': {
    borderColor: 'var(--accent)',
    background: 'var(--accent-soft)',
    color: 'var(--text)',
  },
  '& svg': { fontSize: 18 },
};

const linkButtonSx = {
  border: 0,
  background: 'none',
  p: '6px 10px',
  borderRadius: 999,
  color: 'var(--accent)',
  font: 'inherit',
  fontSize: '0.88rem',
  fontWeight: 600,
  cursor: 'pointer',
  '&:hover': { background: 'var(--accent-soft)' },
};

// Deux colonnes sur grand écran, remplies de haut en bas : l'ordre de lecture
// (et de tabulation) suit le tri.
const listSx = (count) => ({
  m: 0,
  p: 0,
  listStyle: 'none',
  display: 'grid',
  columnGap: 4,
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
  gridAutoFlow: { md: 'column' },
  gridTemplateRows: { md: `repeat(${Math.ceil(count / 2)}, auto)` },
});

const EMPTY = [];

// Les capacités ne font plus partie de la liste : elles sont demandées à PokéAPI
// à l'ouverture de la fiche.
export default function MovesCard({ pokemonId, sx }) {
  const { t, language } = useTranslation();
  const loaded = usePokemonMoves(pokemonId);
  const moves = loaded || EMPTY;
  const [query, setQuery] = useState('');
  const [type, setType] = useState(null);
  const [category, setCategory] = useState(null);
  const [sort, setSort] = useState('default');
  const [expanded, setExpanded] = useState(false);
  const [typeAnchor, setTypeAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);
  const bodyRef = useRef(null);
  const inView = useInView(bodyRef);

  const slugs = useMemo(() => [...new Set(moves)], [moves]);

  const term = query.trim();
  const filtering = Boolean(term || type || category);
  // Filtrer, trier ou chercher un nom localisé exige les détails de toutes les capacités.
  const needsAll = filtering || sort !== 'default';

  // Chargement paresseux : rien tant que la section est hors écran, puis
  // seulement les capacités affichées.
  const wanted = useMemo(() => {
    if (needsAll || expanded) return slugs;
    return inView ? slugs.slice(0, INITIAL_COUNT) : [];
  }, [slugs, needsAll, expanded, inView]);

  const { lookup, retry } = useMoveDetails(wanted);

  const entries = useMemo(() => slugs.map((slug) => ({ slug, move: lookup(slug) })), [slugs, lookup]);
  const progress = useMemo(() => getLoadProgress(entries), [entries]);
  const wantedFailed = useMemo(() => wanted.filter((slug) => lookup(slug) === null).length, [wanted, lookup]);

  // Tant que tout n'est pas chargé, on n'affiche pas un résultat partiel qui
  // changerait d'ordre à chaque réponse.
  const holding = needsAll && !progress.done;

  const rows = useMemo(
    () => (holding ? [] : filterAndSortMoves(entries, { searchTerm: term, type, category, sort, language })),
    [holding, entries, term, type, category, sort, language]
  );

  const visible = expanded || term ? rows : rows.slice(0, INITIAL_COUNT);
  const canToggle = !holding && !term && rows.length > INITIAL_COUNT;

  // Menu des types : ceux réellement présents une fois tout chargé, sinon tous.
  const typeOptions = useMemo(() => {
    const options = progress.done
      ? countMoveTypes(entries)
      : ALL_TYPES.map((name) => ({ type: name, count: null }));
    return type && !options.some((option) => option.type === type) ? [...options, { type, count: 0 }] : options;
  }, [progress.done, entries, type]);

  const resetFilters = () => {
    setQuery('');
    setType(null);
    setCategory(null);
    setSort('default');
  };

  const showToolbar = slugs.length > TOOLBAR_MIN_MOVES;
  const hint =
    filtering && !holding
      ? t(rows.length === 1 ? 'movesFilteredOne' : 'movesFilteredMany', { count: rows.length, total: slugs.length })
      : undefined;

  let body;
  if (loaded === undefined) {
    body = (
      <Box aria-busy="true" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {[92, 120, 78, 104, 132, 86, 110, 96].map((width, i) => (
          <Shimmer key={i} sx={{ width, height: 32, borderRadius: 999 }} />
        ))}
      </Box>
    );
  } else if (loaded === null) {
    body = <Typography sx={mutedTextSx}>{t('movesUnavailable')}</Typography>;
  } else if (slugs.length === 0) {
    body = <Typography sx={mutedTextSx}>{t('noMoves')}</Typography>;
  } else if (holding) {
    body = (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Typography role="status" sx={mutedTextSx}>
            {t('loadingMoves')}
          </Typography>
          <Typography aria-hidden="true" sx={{ ...mutedTextSx, fontVariantNumeric: 'tabular-nums' }}>
            {progress.settled} / {progress.total}
          </Typography>
        </Box>
        <Box
          aria-hidden="true"
          sx={{ height: 4, mb: 1, borderRadius: 999, background: 'var(--surface-3)', overflow: 'hidden' }}
        >
          <Box
            sx={{
              width: `${(progress.settled / Math.max(1, progress.total)) * 100}%`,
              height: '100%',
              borderRadius: 999,
              background: 'var(--accent)',
              transition: 'width 0.2s ease',
            }}
          />
        </Box>
        <Box component="ul" aria-hidden="true" sx={listSx(Math.min(8, slugs.length))}>
          {Array.from({ length: Math.min(8, slugs.length) }, (_, index) => (
            <MoveRowSkeleton key={index} index={index} />
          ))}
        </Box>
      </>
    );
  } else if (visible.length === 0) {
    body = <Typography sx={mutedTextSx}>{t('noMoveFound')}</Typography>;
  } else {
    body = (
      <Box component="ul" sx={listSx(visible.length)}>
        {visible.map(({ slug, move }, index) =>
          move === undefined ? (
            <MoveRowSkeleton key={slug} index={index} />
          ) : (
            <MoveRow key={slug} slug={slug} move={move} />
          )
        )}
      </Box>
    );
  }

  return (
    <SectionCard
      title={loaded ? `${t('moves')} (${slugs.length})` : t('moves')}
      hint={hint}
      sx={sx}
      action={
        showToolbar && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              height: 40,
              px: 1.75,
              width: { xs: '100%', sm: 260 },
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
              onKeyDown={(e) => {
                if (e.key === 'Escape' && query) setQuery('');
              }}
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
      <Box ref={bodyRef}>
        {showToolbar && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box
              component="button"
              type="button"
              onClick={(e) => setTypeAnchor(e.currentTarget)}
              aria-haspopup="menu"
              aria-expanded={Boolean(typeAnchor)}
              aria-label={type ? undefined : `${t('filterByTypes')} : ${t('allTypes')}`}
              data-active={Boolean(type)}
              sx={{ ...controlSx, pl: type ? '8px' : 1.5 }}
            >
              {type ? (
                <>
                  <Box component="span" sx={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                    {t('filterByTypes')} :
                  </Box>
                  <TypeBadge type={type} size="sm" />
                </>
              ) : (
                t('moveType')
              )}
              <KeyboardArrowDownIcon sx={{ mr: '-4px' }} />
            </Box>
            <Menu anchorEl={typeAnchor} open={Boolean(typeAnchor)} onClose={() => setTypeAnchor(null)}>
              <MenuItem
                selected={!type}
                onClick={() => {
                  setType(null);
                  setTypeAnchor(null);
                }}
              >
                {t('allTypes')}
              </MenuItem>
              {typeOptions.map((option) => (
                <MenuItem
                  key={option.type}
                  selected={option.type === type}
                  onClick={() => {
                    setType(option.type);
                    setTypeAnchor(null);
                  }}
                  sx={{ justifyContent: 'space-between', gap: 2 }}
                >
                  <TypeBadge type={option.type} size="sm" />
                  {option.count !== null && (
                    <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' }}>
                      {option.count}
                    </Box>
                  )}
                </MenuItem>
              ))}
            </Menu>

            <Box role="group" aria-label={t('filterByCategory')} sx={{ display: 'flex', gap: 0.75 }}>
              {MOVE_CATEGORIES.map((name) => (
                <Box
                  key={name}
                  component="button"
                  type="button"
                  onClick={() => setCategory((prev) => (prev === name ? null : name))}
                  aria-pressed={category === name}
                  aria-label={t(`moveCategories.${name}`)}
                  title={t(`moveCategories.${name}`)}
                  sx={{ ...controlSx, px: { xs: '11px', sm: 1.5 } }}
                >
                  <MoveCategoryIcon category={name} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {t(`moveCategories.${name}`)}
                  </Box>
                </Box>
              ))}
            </Box>

            <Box
              component="button"
              type="button"
              onClick={(e) => setSortAnchor(e.currentTarget)}
              aria-haspopup="menu"
              aria-expanded={Boolean(sortAnchor)}
              aria-label={`${t('sortBy')} : ${t(`moveSortOptions.${sort}`)}`}
              data-active={sort !== 'default'}
              sx={{ ...controlSx, px: { xs: '11px', sm: 1.5 } }}
            >
              <SortIcon />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {t(`moveSortOptions.${sort}`)}
              </Box>
            </Box>
            <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
              {MOVE_SORTS.map((option) => (
                <MenuItem
                  key={option}
                  selected={option === sort}
                  onClick={() => {
                    setSort(option);
                    setSortAnchor(null);
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '30px !important' }}>
                    {option === sort && <CheckIcon fontSize="small" color="primary" />}
                  </ListItemIcon>
                  {t(`moveSortOptions.${option}`)}
                </MenuItem>
              ))}
            </Menu>

            {needsAll && (
              <Box component="button" type="button" onClick={resetFilters} sx={linkButtonSx}>
                {t('reset')}
              </Box>
            )}
          </Box>
        )}

        {body}

        {!holding && wantedFailed > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 2 }}>
            <Typography role="status" sx={mutedTextSx}>
              {t(wantedFailed === 1 ? 'movesFailedOne' : 'movesFailedMany', { count: wantedFailed })}
            </Typography>
            <Box
              component="button"
              type="button"
              onClick={retry}
              sx={{ ...linkButtonSx, display: 'inline-flex', alignItems: 'center', gap: '6px', '& svg': { fontSize: 18 } }}
            >
              <RefreshIcon />
              {t('retry')}
            </Box>
          </Box>
        )}

        {canToggle && (
          <Box
            component="button"
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            sx={{ ...linkButtonSx, mt: 2, ml: '-10px' }}
          >
            {expanded ? t('showLessMoves') : t('showAllMoves', { count: rows.length })}
          </Box>
        )}
      </Box>
    </SectionCard>
  );
}
