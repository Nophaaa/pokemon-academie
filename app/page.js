'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EVENT_START, MAX_CLIPS, MINECRAFT_GAME_ID, STREAMERS } from '@/lib/constants';
import { apiFetch } from '@/lib/api';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import Navbar from '@/app/components/Navbar';
import Hero from '@/app/components/Hero';
import StatsBar from '@/app/components/StatsBar';
import LiveBanner from '@/app/components/LiveBanner';
import StreamersGrid from '@/app/components/StreamersGrid';
import StatsModal from '@/app/components/StatsModal';
import ClipPlayerModal from '@/app/components/ClipPlayerModal';
import ClipsSection from '@/app/components/ClipsSection';
import StreamModal from '@/app/components/StreamModal';
import ScrollToTop from '@/app/components/ScrollToTop';
import ToastContainer from '@/app/components/ToastContainer';
import useScrollReveal from '@/app/hooks/useScrollReveal';

const CLIPS_PER_PAGE = 9;
const REFRESH_INTERVAL = 5 * 60 * 1000;
const THEME_KEY = 'pa2_theme';

function HomePage() {
  const [users, setUsers] = useState({});
  const [streams, setStreams] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [clips, setClips] = useState(null);
  const [clipsTitle, setClipsTitle] = useState('Tous les clips — Minecraft');
  const [clipsLoading, setClipsLoading] = useState(false);
  const [allClipsLoading, setAllClipsLoading] = useState(false);
  const [initialClipsLoaded, setInitialClipsLoaded] = useState(false);

  const [streamModal, setStreamModal] = useState(null);
  const [statsModal, setStatsModal] = useState(null);
  const [clipPlayer, setClipPlayer] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState('live');
  const [theme, setTheme] = useState('dark');
  const [countdown, setCountdown] = useState('');
  const [loadError, setLoadError] = useState(false);

  const toastIdRef = useRef(0);
  const nextRefreshAt = useRef(0);
  const clipsSectionRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const preferred = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    setTheme(preferred);
    document.documentElement.setAttribute('data-theme', preferred);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const loadAll = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        setLoadError(false);
        const userParams = STREAMERS.map((s) => `login=${encodeURIComponent(s)}`).join('&');
        const streamParams = STREAMERS.map((s) => `user_login=${encodeURIComponent(s)}`).join('&');

        const [usersData, streamsData] = await Promise.all([
          apiFetch(`/users?${userParams}`),
          apiFetch(`/streams?${streamParams}&first=100`),
        ]);

        const usersMap = {};
        for (const user of usersData.data || []) usersMap[user.login.toLowerCase()] = user;

        const streamsMap = {};
        for (const stream of streamsData.data || []) streamsMap[stream.user_login.toLowerCase()] = stream;

        setUsers(usersMap);
        setStreams(streamsMap);
      } catch (err) {
        console.error('Erreur de chargement :', err);
        setLoadError(true);
        showToast(`Erreur : ${err.message}`, 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    loadAll(false);
    nextRefreshAt.current = Date.now() + REFRESH_INTERVAL;

    const refreshId = setInterval(() => {
      loadAll(true);
      nextRefreshAt.current = Date.now() + REFRESH_INTERVAL;
    }, REFRESH_INTERVAL);

    const countdownId = setInterval(() => {
      const remaining = Math.max(0, nextRefreshAt.current - Date.now());
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setCountdown(`Mise à jour dans ${m}:${String(s).padStart(2, '0')}`);
    }, 1000);

    return () => {
      clearInterval(refreshId);
      clearInterval(countdownId);
    };
  }, [loadAll]);

  const handleRefresh = useCallback(() => {
    loadAll(true);
    nextRefreshAt.current = Date.now() + REFRESH_INTERVAL;
  }, [loadAll]);

  // Auto-load all clips once users are available
  useEffect(() => {
    if (initialClipsLoaded || loading || Object.keys(users).length === 0) return;
    setInitialClipsLoaded(true);

    (async () => {
      setClipsLoading(true);
      try {
        const allUsers = Object.values(users);
        const results = await Promise.all(
          allUsers.map((u) =>
            apiFetch(`/clips?broadcaster_id=${u.id}&first=20&started_at=${EVENT_START}`)
              .then((d) => (d.data || []).filter((c) => c.game_id === MINECRAFT_GAME_ID && c.created_at >= EVENT_START))
              .catch(() => []),
          ),
        );
        const all = results.flat().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setClips(all);
      } catch (err) {
        console.error('Erreur chargement initial clips :', err);
        setClips([]);
      } finally {
        setClipsLoading(false);
      }
    })();
  }, [users, loading, initialClipsLoaded]);

  const handleLoadClips = useCallback(
    async (broadcasterId, displayName) => {
      clipsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      setClipsTitle(`Clips — ${displayName}`);
      setClipsLoading(true);
      setClips([]);

      try {
        const data = await apiFetch(
          `/clips?broadcaster_id=${broadcasterId}&first=${MAX_CLIPS}&started_at=${EVENT_START}`,
        );
        const mcClips = (data.data || []).filter((c) => c.game_id === MINECRAFT_GAME_ID && c.created_at >= EVENT_START);
        setClips(mcClips);
      } catch (err) {
        console.error('Erreur clips :', err);
        setClips([]);
        showToast('Erreur lors du chargement des clips.', 'error');
      } finally {
        setClipsLoading(false);
      }
    },
    [showToast],
  );

  const handleLoadAllClips = useCallback(async () => {
    clipsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setClipsTitle('Tous les clips — Minecraft');
    setAllClipsLoading(true);
    setClips([]);

    try {
      const allUsers = Object.values(users);
      if (allUsers.length === 0) {
        const usersData = await apiFetch(`/users?${STREAMERS.map((s) => `login=${encodeURIComponent(s)}`).join('&')}`);
        allUsers.push(...(usersData.data || []));
      }

      const results = await Promise.all(
        allUsers.map((u) =>
          apiFetch(`/clips?broadcaster_id=${u.id}&first=20&started_at=${EVENT_START}`)
            .then((d) => (d.data || []).filter((c) => c.game_id === MINECRAFT_GAME_ID && c.created_at >= EVENT_START))
            .catch(() => []),
        ),
      );

      const all = results.flat().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setClips(all);
    } catch (err) {
      console.error('Erreur tous les clips :', err);
      setClips([]);
      showToast('Erreur lors du chargement des clips.', 'error');
    } finally {
      setAllClipsLoading(false);
    }
  }, [users, showToast]);

  const handleCloseClips = useCallback(() => {
    // Reset to all clips instead of hiding
    if (!initialClipsLoaded) return;
    setClipsTitle('Tous les clips — Minecraft');
    setAllClipsLoading(true);
    (async () => {
      try {
        const allUsers = Object.values(users);
        const results = await Promise.all(
          allUsers.map((u) =>
            apiFetch(`/clips?broadcaster_id=${u.id}&first=20&started_at=${EVENT_START}`)
              .then((d) => (d.data || []).filter((c) => c.game_id === MINECRAFT_GAME_ID && c.created_at >= EVENT_START))
              .catch(() => []),
          ),
        );
        const all = results.flat().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setClips(all);
      } catch {
        setClips([]);
      } finally {
        setAllClipsLoading(false);
      }
    })();
  }, [users, initialClipsLoaded]);

  const handleStatsClick = useCallback(
    async (userId, displayName, rawLogin) => {
      const user = users[rawLogin.toLowerCase()];
      setStatsModal({ user, stats: null, loading: true });

      try {
        const [clipsData, videosData] = await Promise.all([
          apiFetch(`/clips?broadcaster_id=${userId}&first=100&started_at=${EVENT_START}`),
          apiFetch(`/videos?user_id=${userId}&type=archive&first=100`),
        ]);
        const allClips = (clipsData.data || []).filter(
          (c) => c.game_id === MINECRAFT_GAME_ID && c.created_at >= EVENT_START,
        );
        const totalClipViews = allClips.reduce((sum, c) => sum + (c.view_count || 0), 0);
        const topClip = [...allClips].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0] ?? null;

        const mcVideos = (videosData.data || []).filter((v) => v.created_at >= EVENT_START);
        const fetchedSeconds = mcVideos.reduce((sum, v) => {
          const match = v.duration?.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
          if (!match) return sum;
          return sum + (parseInt(match[1] || 0) * 3600 + parseInt(match[2] || 0) * 60 + parseInt(match[3] || 0));
        }, 0);

        // Persist max hours per streamer to handle VOD expiration
        const HOURS_CACHE_KEY = 'pa2_streamer_hours';
        let cache = {};
        try { cache = JSON.parse(localStorage.getItem(HOURS_CACHE_KEY) || '{}'); } catch { /* ignore */ }
        const cached = cache[userId] || 0;
        const bestSeconds = Math.max(cached, fetchedSeconds);
        cache[userId] = bestSeconds;
        try { localStorage.setItem(HOURS_CACHE_KEY, JSON.stringify(cache)); } catch { /* ignore */ }

        setStatsModal({
          user,
          loading: false,
          stats: {
            clipCount: allClips.length,
            totalClipViews,
            topClip,
            vodCount: mcVideos.length,
            totalStreamH: Math.round((bestSeconds / 3600) * 10) / 10,
          },
        });
      } catch (err) {
        console.error('Erreur stats :', err);
        showToast('Erreur lors du chargement des stats.', 'error');
        setStatsModal(null);
      }
    },
    [users, showToast],
  );

  useScrollReveal();

  return (
    <>
      <Navbar
        onRefresh={handleRefresh}
        refreshing={refreshing}
        theme={theme}
        onToggleTheme={toggleTheme}
        countdown={countdown}
      />

      <Hero />

      <div className="scroll-reveal">
        <StatsBar users={users} streams={streams} clips={clips} loading={loading} />
      </div>

      <LiveBanner
        users={users}
        streams={streams}
        loading={loading}
        loadError={loadError}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <section className="section streamers-section scroll-reveal" id="streamers">
        <div className="section__inner">
          <div className="streamers-header">
            <h2 className="section__title">Les Streamers</h2>
            <div className="streamers-header__controls">
              <select
                className="streamers-sort"
                aria-label="Trier les streamers"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
              >
                <option value="live">En live d'abord</option>
                <option value="viewers">Par viewers</option>
                <option value="alpha">Alphabétique</option>
              </select>
              <input
                type="search"
                className="search-input"
                placeholder="Rechercher un streamer…"
                aria-label="Rechercher un streamer"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <StreamersGrid
            users={users}
            streams={streams}
            loading={loading}
            search={search}
            sortMode={sortMode}
            onClipsClick={handleLoadClips}
            onStatsClick={handleStatsClick}
          />
        </div>
      </section>

      <ClipsSection
        clips={clips}
        clipsTitle={clipsTitle}
        clipsLoading={clipsLoading}
        onClose={handleCloseClips}
        onLoadAll={handleLoadAllClips}
        allClipsLoading={allClipsLoading}
        onPlayClip={setClipPlayer}
        clipsPerPage={CLIPS_PER_PAGE}
        sectionRef={clipsSectionRef}
      />

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__left">
            <div className="footer__brand">PA2 HUB TRACKER</div>
            <div className="footer__copy">© {new Date().getFullYear()} — Tous droits réservés.</div>
            <a href="/politique-de-confidentialite" className="footer__policy-link">
              Politique de confidentialité
            </a>
          </div>

          <div className="footer__center">
            <p>
              Ce site est un projet <strong>communautaire</strong> non affilié à l'événement.
            </p>
            <p>
              Non affilié à <strong>Mojang Studios</strong>, <strong>Nintendo</strong> ni à l'équipe{' '}
              <strong>Cobblemon</strong>.
            </p>
          </div>

          <div className="footer__right">
            <a
              href="https://twitch.tv/nophaa"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-btn footer__social-btn--twitch"
            >
              <svg className="footer__twitch-icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
              </svg>
              SUIVRE NOPHAA
            </a>
          </div>
        </div>
      </footer>

      <StreamModal streamModal={streamModal} onClose={() => setStreamModal(null)} />
      <StatsModal statsModal={statsModal} onClose={() => setStatsModal(null)} />
      <ClipPlayerModal clip={clipPlayer} onClose={() => setClipPlayer(null)} />
      <ToastContainer toasts={toasts} />
      <ScrollToTop />
    </>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  );
}
