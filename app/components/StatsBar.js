'use client';

import { useEffect, useState } from 'react';
import { STREAMERS, EVENT_START } from '@/lib/constants';
import { apiFetch } from '@/lib/api';
import { formatViews } from '@/lib/utils';

const HOURS_CACHE_KEY = 'pa2_streamer_hours';

function parseDuration(dur) {
  if (!dur) return 0;
  const match = dur.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  if (!match) return 0;
  return (parseInt(match[1] || 0) * 3600) + (parseInt(match[2] || 0) * 60) + (parseInt(match[3] || 0));
}

function loadCachedHours() {
  try {
    const raw = localStorage.getItem(HOURS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCachedHours(cache) {
  try {
    localStorage.setItem(HOURS_CACHE_KEY, JSON.stringify(cache));
  } catch { /* quota exceeded — ignore */ }
}

export default function StatsBar({ users, streams, clips, loading }) {
  const liveCount = Object.keys(streams).length;
  const totalClips = clips?.length ?? 0;
  const [totalHours, setTotalHours] = useState(null);
  const [hoursLoading, setHoursLoading] = useState(true);

  const totalViewers = Object.values(streams).reduce((sum, s) => sum + (s.viewer_count || 0), 0);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    async function fetchTotalHours() {
      setHoursLoading(true);
      try {
        // Always use all users, not just live ones
        let userIds = Object.values(users).map((u) => u.id).filter(Boolean);

        if (userIds.length === 0) {
          const userParams = STREAMERS.map((s) => `login=${encodeURIComponent(s)}`).join('&');
          const usersData = await apiFetch(`/users?${userParams}`);
          userIds = (usersData.data || []).map((u) => u.id);
        }

        const cache = loadCachedHours();

        const results = await Promise.all(
          userIds.map((uid) =>
            apiFetch(`/videos?user_id=${uid}&type=archive&first=100`)
              .then((d) => {
                const vods = (d.data || []).filter((v) => v.created_at >= EVENT_START);
                const fetchedSeconds = vods.reduce((sum, v) => sum + parseDuration(v.duration), 0);
                const cached = cache[uid] || 0;
                const best = Math.max(cached, fetchedSeconds);
                cache[uid] = best;
                return best;
              })
              .catch(() => cache[uid] || 0),
          ),
        );

        saveCachedHours(cache);

        // Also add live stream time
        const liveSeconds = Object.values(streams).reduce((sum, st) => {
          return sum + Math.max(0, (Date.now() - new Date(st.started_at).getTime()) / 1000);
        }, 0);

        const totalSeconds = results.reduce((a, b) => a + b, 0) + liveSeconds;
        if (!cancelled) {
          setTotalHours(Math.floor(totalSeconds / 3600));
          setHoursLoading(false);
        }
      } catch {
        if (!cancelled) {
          setTotalHours(0);
          setHoursLoading(false);
        }
      }
    }

    fetchTotalHours();
    return () => { cancelled = true; };
  }, [users, streams, loading]);

  const val = (v) => (loading ? '—' : v);
  const hoursVal = loading || hoursLoading ? '—' : totalHours;

  return (
    <section className="stats-bar">
      <div className="stats-bar__inner">
        <div className="stats-card stats-card--gold">
          <div className="stats-card__pokeball-top"></div>
          <div className="stats-card__pokeball-divider">
            <span className="stats-card__pokeball-btn"></span>
          </div>
          <div className="stats-card__pokeball-bottom">
            <div className="stats-card__label">STREAMERS EN LIVE</div>
            <div className="stats-card__value">{val(liveCount)}</div>
          </div>
        </div>
        <div className="stats-card stats-card--red">
          <div className="stats-card__pokeball-top"></div>
          <div className="stats-card__pokeball-divider">
            <span className="stats-card__pokeball-btn"></span>
          </div>
          <div className="stats-card__pokeball-bottom">
            <div className="stats-card__label">PARTICIPANTS</div>
            <div className="stats-card__value">{STREAMERS.length}</div>
          </div>
        </div>
        <div className="stats-card stats-card--green">
          <div className="stats-card__pokeball-top"></div>
          <div className="stats-card__pokeball-divider">
            <span className="stats-card__pokeball-btn"></span>
          </div>
          <div className="stats-card__pokeball-bottom">
            <div className="stats-card__label">SPECTATEURS</div>
            <div className="stats-card__value">{val(formatViews(totalViewers))}</div>
          </div>
        </div>
        <div className="stats-card stats-card--blue">
          <div className="stats-card__pokeball-top"></div>
          <div className="stats-card__pokeball-divider">
            <span className="stats-card__pokeball-btn"></span>
          </div>
          <div className="stats-card__pokeball-bottom">
            <div className="stats-card__label">TEMPS DE JEU</div>
            <div className="stats-card__value">{hoursVal}</div>
            <div className="stats-card__sub">heures de stream</div>
          </div>
        </div>
        <div className="stats-card stats-card--purple">
          <div className="stats-card__pokeball-top"></div>
          <div className="stats-card__pokeball-divider">
            <span className="stats-card__pokeball-btn"></span>
          </div>
          <div className="stats-card__pokeball-bottom">
            <div className="stats-card__label">CLIPS DISPONIBLES</div>
            <div className="stats-card__value">{val(totalClips)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
