'use client';

import { useState } from 'react';
import FallbackAvatar from '@/app/components/FallbackAvatar';
import { formatViews } from '@/lib/utils';

function LiveCard({ login, stream, user }) {
  const [thumbError, setThumbError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  return (
    <a className="live-card" href={`https://twitch.tv/${login}`} target="_blank" rel="noopener noreferrer">
      <div className="live-card__thumb-wrap">
        {stream.thumbnail_url && !thumbError && (
          <img
            src={stream.thumbnail_url.replace('{width}', '440').replace('{height}', '248')}
            alt={stream.title || `Stream en direct de ${user?.display_name || login}`}
            className="live-card__thumb"
            loading="lazy"
            onError={() => setThumbError(true)}
          />
        )}
        <div className="live-card__play-overlay"></div>
      </div>
      <div className="live-card__footer">
        {user?.profile_image_url && !avatarError ? (
          <img
            src={user.profile_image_url}
            alt={login}
            className="live-card__avatar"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <FallbackAvatar login={login} className="live-card__avatar live-card__avatar--fallback" />
        )}
        <div className="live-card__info">
          <div className="live-card__name">
            {user?.display_name || login} <span className="live-badge">LIVE</span>
          </div>
          {stream.title && <div className="live-card__title">{stream.title}</div>}
          <div className="live-card__viewers">
            {formatViews(stream.viewer_count)} spectateurs
            {stream.game_name ? ` · ${stream.game_name}` : ''}
          </div>
        </div>
      </div>
    </a>
  );
}

export default function LiveBanner({ users, streams, loading, loadError, onRefresh, refreshing }) {
  const liveLogins = Object.keys(streams);

  return (
    <section className="live-banner" id="liveBanner">
      <div className="live-banner__header">
        <h2 className="live-banner__title">
          <span className="live-dot" aria-hidden="true"></span>
          En ce moment sur Twitch
        </h2>
        <button className="btn btn--ghost" onClick={onRefresh} disabled={refreshing} title="Rafraîchir les statuts">
          {refreshing ? '↺ Chargement…' : '↺ Rafraîchir'}
        </button>
      </div>
      <div className="live-banner__grid" id="liveGrid" aria-live="polite">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="live-card live-card--skeleton" aria-hidden="true">
                <div className="live-card__thumb-wrap"></div>
                <div className="live-card__footer">
                  <div className="skeleton-circle"></div>
                  <div className="skeleton-lines">
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : loadError ? (
          <div className="live-banner__empty">
            <p>Erreur de chargement.</p>
            <button className="btn btn--ghost" onClick={onRefresh} style={{ marginTop: '8px' }}>
              Réessayer
            </button>
          </div>
        ) : liveLogins.length === 0 ? (
          <p className="live-banner__empty">Aucun streamer en live pour le moment.</p>
        ) : (
          liveLogins.map((login) => <LiveCard key={login} login={login} stream={streams[login]} user={users[login]} />)
        )}
      </div>
    </section>
  );
}
