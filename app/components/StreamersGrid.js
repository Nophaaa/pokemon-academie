import { STREAMERS } from '@/lib/constants';
import StreamerCard from '@/app/components/StreamerCard';

export default function StreamersGrid({ users, streams, loading, search, sortMode, onClipsClick, onStatsClick }) {
  if (loading) {
    return (
      <div className="streamers-grid" id="streamersGrid">
        {STREAMERS.map((s) => (
          <div key={s} className="streamer-card streamer-card--skeleton"></div>
        ))}
      </div>
    );
  }

  const query = search.trim().toLowerCase();

  const filtered = query
    ? STREAMERS.filter((rawLogin) => {
        const user = users[rawLogin.toLowerCase()];
        return rawLogin.toLowerCase().includes(query) || (user?.display_name || '').toLowerCase().includes(query);
      })
    : STREAMERS;

  const sorted = [...filtered].sort((a, b) => {
    const la = a.toLowerCase();
    const lb = b.toLowerCase();
    const streamA = streams[la];
    const streamB = streams[lb];
    const userA = users[la];
    const userB = users[lb];

    if (sortMode === 'live') {
      const liveA = streamA ? 1 : 0;
      const liveB = streamB ? 1 : 0;
      if (liveA !== liveB) return liveB - liveA;
      return (streamB?.viewer_count || 0) - (streamA?.viewer_count || 0);
    }
    if (sortMode === 'viewers') {
      return (streamB?.viewer_count || 0) - (streamA?.viewer_count || 0);
    }
    if (sortMode === 'alpha') {
      const nameA = (userA?.display_name || a).toLowerCase();
      const nameB = (userB?.display_name || b).toLowerCase();
      return nameA.localeCompare(nameB, 'fr');
    }
    return 0;
  });

  return (
    <div className="streamers-grid" id="streamersGrid">
      {sorted.length === 0 ? (
        <p className="clips-empty">Aucun streamer trouvé pour &laquo;{search}&raquo;.</p>
      ) : (
        sorted.map((rawLogin) => (
          <StreamerCard
            key={rawLogin}
            login={rawLogin}
            user={users[rawLogin.toLowerCase()]}
            stream={streams[rawLogin.toLowerCase()]}
            onClipsClick={onClipsClick}
            onStatsClick={onStatsClick}
          />
        ))
      )}
    </div>
  );
}
