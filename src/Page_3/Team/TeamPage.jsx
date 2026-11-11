import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkIcon from '@mui/icons-material/Link';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import UndoIcon from '@mui/icons-material/Undo';
import { usePokemon } from '../../context/PokemonContext.jsx';
import { useTeam } from '../../TeamContext.jsx';
import { useTranslation } from '../../i18n/translations.js';
import { getPokemonName } from '../../utils/pokemon.js';
import { TEAM_PARAM, buildTeamUrl, isSameTeam, parseTeamParam, summarizeTeamStats } from '../../utils/team.js';
import { pillButtonSx } from '../../components/FavoriteButton.jsx';
import { TeamEmptySlot, TeamMemberSlot, TeamSlotSkeleton } from './TeamSlots.jsx';
import TeamCoverageCard, { visuallyHiddenSx } from './TeamCoverageCard.jsx';
import TeamStatsCard from './TeamStatsCard.jsx';

const pageSx = {
  maxWidth: 'var(--page-max)',
  mx: 'auto',
  px: { xs: 2, md: 3 },
  pt: { xs: 2.5, md: 4 },
};

const bannerSx = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1.5,
  mb: 2.5,
  p: 2,
  pl: 2.5,
  borderRadius: 'var(--radius-md)',
};

export default function TeamPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pokemons, loading, error, refetch, getPokemonById } = usePokemon();
  const { team, setTeam, removeFromTeam, clearTeam, maxSize } = useTeam();

  const [undo, setUndo] = useState(null);
  const [invalidLink, setInvalidLink] = useState(false);
  const [copyState, setCopyState] = useState('idle');
  const [statsById, setStatsById] = useState({});
  const [statsAttempt, setStatsAttempt] = useState(0);
  const slotRefs = useRef([]);
  const pendingFocus = useRef(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const dataReady = !loading && !error && pokemons.length > 0;

  // Équipe portée par le lien (/team?p=1,4,7), limitée aux Pokémon connus.
  const sharedParam = searchParams.get(TEAM_PARAM);
  const sharedIds = useMemo(() => {
    if (sharedParam === null || !dataReady) return null;
    return parseTeamParam(sharedParam).filter((id) => getPokemonById(id));
  }, [sharedParam, dataReady, getPokemonById]);

  const hasShared = Boolean(sharedIds && sharedIds.length > 0);
  // Aperçu : le lien décrit une autre équipe que celle déjà enregistrée ici.
  const isPreview = hasShared && team.length > 0 && !isSameTeam(sharedIds, team);
  const displayIds = hasShared ? sharedIds : team;

  const leaveSharedLink = useCallback(() => navigate('/team', { replace: true }), [navigate]);

  // Lecture du lien au chargement : il est adopté d'office si aucune équipe
  // n'est enregistrée, et jamais sans accord s'il en remplacerait une.
  useEffect(() => {
    if (sharedIds === null) return;
    if (sharedIds.length === 0) {
      setInvalidLink(true);
      leaveSharedLink();
    } else if (isSameTeam(sharedIds, team)) {
      leaveSharedLink();
    } else if (team.length === 0) {
      setTeam(sharedIds);
      leaveSharedLink();
    }
  }, [sharedIds, team, setTeam, leaveSharedLink]);

  const members = useMemo(
    () => (dataReady ? displayIds.map((id) => getPokemonById(id)).filter(Boolean) : []),
    [dataReady, displayIds, getPokemonById]
  );

  // Statistiques remontées par chaque emplacement (usePokemonStats).
  const handleStats = useCallback((id, state) => {
    setStatsById((prev) => (prev[id] === state ? prev : { ...prev, [id]: state }));
  }, []);
  const memberStats = members.map((pokemon) => statsById[pokemon.id]);
  const statsLoading = memberStats.some((state) => !state || state.loading);
  const statsKey = memberStats.map((state) => (state && !state.loading ? state.total ?? 'x' : '?')).join('|');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const summary = useMemo(() => summarizeTeamStats(memberStats), [statsKey, members.length]);

  // Après un retrait, le focus passe à l'emplacement qui prend la place.
  useEffect(() => {
    if (pendingFocus.current === null) return;
    slotRefs.current[pendingFocus.current]?.focus();
    pendingFocus.current = null;
  }, [team]);

  const shareUrl = buildTeamUrl(displayIds, window.location.origin);
  useEffect(() => {
    setCopyState('idle');
  }, [shareUrl]);
  useEffect(() => {
    if (copyState !== 'copied') return undefined;
    const timer = setTimeout(() => setCopyState('idle'), 2500);
    return () => clearTimeout(timer);
  }, [copyState]);

  const copyLink = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(shareUrl);
      setCopyState('copied');
    } catch (e) {
      // Presse-papiers refusé ou absent : le lien est affiché pour une copie manuelle.
      setCopyState('failed');
    }
  };

  const handleRemove = (pokemon, index) => {
    setUndo({ ids: team, kind: 'removed', pokemonId: pokemon.id });
    pendingFocus.current = index;
    removeFromTeam(pokemon.id);
  };

  const handleClear = () => {
    setUndo({ ids: team, kind: 'cleared' });
    pendingFocus.current = 0;
    clearTeam();
  };

  const handleUndo = () => {
    pendingFocus.current = undo.kind === 'removed' ? Math.max(0, undo.ids.indexOf(undo.pokemonId)) : 0;
    setTeam(undo.ids);
    setUndo(null);
  };

  const adoptShared = () => {
    setUndo(null);
    setTeam(sharedIds);
    leaveSharedLink();
  };

  const undoMessage = !undo
    ? ''
    : undo.kind === 'cleared'
      ? t('team.cleared')
      : t('team.removed', { name: getPokemonName(getPokemonById(undo.pokemonId), language) });

  const slots = Array.from({ length: maxSize }, (_, index) => members[index] || null);
  const count = members.length;

  return (
    <Box sx={pageSx}>
      <Box component="nav" sx={{ mb: 2.5 }}>
        <Box component={Link} to="/" sx={{ ...pillButtonSx, textDecoration: 'none' }}>
          <ArrowBackIcon />
          {t('appTitle')}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: { xs: '2.1rem', md: '2.8rem' },
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
              }}
            >
              {isPreview ? t('team.sharedTitle') : t('team.title')}
            </Typography>
            {dataReady && (
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 30,
                  px: 1.5,
                  borderRadius: 999,
                  background: 'var(--team-soft)',
                  border: '1px solid color-mix(in srgb, var(--team) 50%, transparent)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span aria-hidden="true">
                  {count}/{maxSize}
                </span>
                <Box component="span" sx={visuallyHiddenSx}>
                  {t('team.slotsFilled', { count, max: maxSize })}
                </Box>
              </Box>
            )}
          </Box>
          <Typography sx={{ color: 'var(--text-muted)', mt: 1, maxWidth: 560 }}>
            {t('team.subtitle', { max: maxSize })}
          </Typography>
        </Box>

        {count > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <Box
              component="button"
              type="button"
              onClick={copyLink}
              sx={{
                ...pillButtonSx,
                ...(copyState === 'copied' && {
                  background: 'var(--team)',
                  borderColor: 'var(--team)',
                  color: 'var(--team-contrast)',
                  '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--team)' },
                }),
              }}
            >
              {copyState === 'copied' ? <CheckIcon /> : <LinkIcon />}
              {copyState === 'copied' ? t('team.linkCopied') : t('team.copyLink')}
            </Box>
            {!isPreview && (
              <Box
                component="button"
                type="button"
                onClick={handleClear}
                sx={{ ...pillButtonSx, '&:hover': { ...pillButtonSx['&:hover'], color: 'var(--accent)' } }}
              >
                <DeleteOutlineIcon />
                {t('team.clear')}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Annonces pour les lecteurs d'écran : copie du lien */}
      <Box role="status" sx={visuallyHiddenSx}>
        {copyState === 'copied' ? t('team.linkCopied') : ''}
      </Box>

      {copyState === 'failed' && (
        <Box
          role="alert"
          sx={{
            ...bannerSx,
            background: 'color-mix(in srgb, var(--star) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--star) 45%, transparent)',
          }}
        >
          <Typography component="label" htmlFor="team-share-link" sx={{ fontWeight: 600, fontSize: '0.92rem' }}>
            {t('team.copyFailed')}
          </Typography>
          <Box
            component="input"
            id="team-share-link"
            readOnly
            value={shareUrl}
            aria-label={t('team.shareLinkLabel')}
            onFocus={(event) => event.target.select()}
            sx={{
              flex: '1 1 260px',
              minWidth: 0,
              height: 40,
              px: 1.5,
              borderRadius: 999,
              border: '1px solid var(--border-strong)',
              background: 'var(--surface)',
              color: 'var(--text)',
              font: 'inherit',
              fontSize: '0.88rem',
            }}
          />
        </Box>
      )}

      {invalidLink && (
        <Box
          role="alert"
          sx={{
            ...bannerSx,
            background: 'var(--accent-soft)',
            border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>{t('team.sharedInvalid')}</Typography>
          <IconButton onClick={() => setInvalidLink(false)} aria-label={t('team.dismiss')} sx={{ color: 'var(--text-muted)' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      {isPreview && (
        <Box
          role="region"
          aria-label={t('team.sharedTitle')}
          sx={{
            ...bannerSx,
            background: 'var(--team-soft)',
            border: '1px solid color-mix(in srgb, var(--team) 50%, transparent)',
          }}
        >
          <Typography sx={{ flex: '1 1 280px', fontSize: '0.95rem' }}>{t('team.sharedDesc')}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <Box
              component="button"
              type="button"
              onClick={adoptShared}
              sx={{
                ...pillButtonSx,
                background: 'var(--team)',
                borderColor: 'var(--team)',
                color: 'var(--team-contrast)',
                '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--team)' },
              }}
            >
              {t('team.adoptShared')}
            </Box>
            <Box component="button" type="button" onClick={leaveSharedLink} sx={pillButtonSx}>
              {t('team.keepMine')}
            </Box>
          </Box>
        </Box>
      )}

      {/* Retrait d'un membre ou vidage : annoncé, et annulable */}
      <Box
        role="status"
        sx={
          undo
            ? {
                ...bannerSx,
                py: 1.25,
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
              }
            : visuallyHiddenSx
        }
      >
        {undo && (
          <>
            <Typography sx={{ fontSize: '0.92rem', fontWeight: 500, textTransform: 'none' }}>{undoMessage}</Typography>
            <Box component="button" type="button" onClick={handleUndo} sx={{ ...pillButtonSx, height: 36 }}>
              <UndoIcon />
              {t('team.undo')}
            </Box>
          </>
        )}
      </Box>

      {error ? (
        <Box role="alert" sx={{ ...bannerSx, background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)' }}>
          <Box>
            <Typography sx={{ fontWeight: 600 }}>{t('loadError')}</Typography>
            <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t('loadErrorDesc')}</Typography>
          </Box>
          <Box component="button" type="button" onClick={refetch} sx={pillButtonSx}>
            <RefreshIcon />
            {t('retry')}
          </Box>
        </Box>
      ) : (
        <>
          <Box
            component="ul"
            aria-label={t('team.slotsLabel')}
            aria-busy={!dataReady}
            sx={{
              m: 0,
              p: 0,
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(6, minmax(0, 1fr))',
              },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {slots.map((pokemon, index) => (
              <Box component="li" key={pokemon ? `p-${pokemon.id}` : `empty-${index}`} sx={{ minWidth: 0 }}>
                {!dataReady ? (
                  <TeamSlotSkeleton />
                ) : pokemon ? (
                  <TeamMemberSlot
                    key={`${pokemon.id}-${statsAttempt}`}
                    pokemon={pokemon}
                    onStats={handleStats}
                    onRemove={isPreview ? undefined : () => handleRemove(pokemon, index)}
                    removeRef={(node) => {
                      slotRefs.current[index] = node;
                    }}
                  />
                ) : (
                  <TeamEmptySlot
                    index={index + 1}
                    interactive={!isPreview}
                    linkRef={(node) => {
                      slotRefs.current[index] = node;
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          {dataReady && count === 0 && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography component="h2" sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', mb: 0.75 }}>
                {t('team.emptyTitle')}
              </Typography>
              <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 460, mx: 'auto', mb: 2.5 }}>
                {t('team.emptyDesc', { max: maxSize })}
              </Typography>
              <Box component={Link} to="/" sx={{ ...pillButtonSx, textDecoration: 'none' }}>
                {t('team.browse')}
              </Box>
            </Box>
          )}

          {dataReady && count > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.6fr) minmax(0, 1fr)' },
                alignItems: 'start',
                gap: 2.5,
                mt: 2.5,
              }}
            >
              <TeamCoverageCard members={members} />
              <TeamStatsCard
                summary={summary}
                loading={statsLoading}
                onRetry={() => setStatsAttempt((attempt) => attempt + 1)}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
