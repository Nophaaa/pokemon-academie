'use client';

import { useState } from 'react';
import FallbackAvatar from '@/app/components/FallbackAvatar';
import { formatViews } from '@/lib/utils';

export default function StreamerCard({ login: rawLogin, user, stream, onClipsClick, onStatsClick }) {
  const login = rawLogin.toLowerCase();
  const isLive = Boolean(stream);
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div className={`streamer-card${isLive ? ' streamer-card--live' : ''}`} data-login={login}>
      <div className="streamer-card__avatar-wrap">
        {user?.profile_image_url && !avatarError ? (
          <img
            src={user.profile_image_url}
            alt={`Avatar de ${rawLogin}`}
            className="streamer-card__avatar"
            loading="lazy"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <FallbackAvatar login={rawLogin} />
        )}
        {isLive && <span className="streamer-card__live-ring" aria-hidden="true"></span>}
      </div>

      <div className="streamer-card__name">{user?.display_name || rawLogin}</div>

      <span className={`streamer-card__status ${isLive ? 'status--live' : 'status--offline'}`}>
        <span className={`status-dot ${isLive ? 'status-dot--live' : 'status-dot--offline'}`} aria-hidden="true"></span>
        {isLive ? 'EN LIVE' : 'Hors ligne'}
      </span>

      {isLive && stream.game_name && <div className="streamer-card__game">{stream.game_name}</div>}

      {isLive && stream.viewer_count !== undefined && (
        <div className="streamer-card__viewers">{formatViews(stream.viewer_count)} spectateurs</div>
      )}

      <div className="streamer-card__actions">
        <button
          className="btn btn--purple btn--sm"
          onClick={() => {
            if (user?.id) onClipsClick(user.id, user?.display_name || rawLogin);
          }}
        >
          Clips
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => {
            if (user?.id) onStatsClick(user.id, user?.display_name || rawLogin, rawLogin);
          }}
        >
          Stats
        </button>
        <a
          href={`https://twitch.tv/${login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--ghost btn--sm"
        >
          Twitch
        </a>
      </div>
    </div>
  );
}
