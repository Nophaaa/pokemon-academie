'use client';

import { useState } from 'react';
import { formatDate, formatDuration, formatViews, isRecentClip } from '@/lib/utils';

export default function ClipCard({ clip, onPlay }) {
  const [thumbError, setThumbError] = useState(false);

  return (
    <button className="clip-card" onClick={() => onPlay(clip)} title={clip.title}>
      <div className="clip-card__thumb-wrap">
        {!thumbError && (
          <img
            src={clip.thumbnail_url.replace('%{width}', '480').replace('%{height}', '270')}
            alt={clip.title || `Clip de ${clip.broadcaster_name}`}
            className="clip-card__thumb"
            loading="lazy"
            onError={() => setThumbError(true)}
          />
        )}
        <div className="clip-card__play" aria-hidden="true"></div>
        <span className="clip-card__duration">{formatDuration(clip.duration)}</span>
        {isRecentClip(clip.created_at) && <span className="clip-card__new-badge">NOUVEAU</span>}
      </div>
      <div className="clip-card__body">
        <div className="clip-card__title">{clip.title || 'Sans titre'}</div>
        {clip.broadcaster_name && <div className="clip-card__streamer">{clip.broadcaster_name}</div>}
        <div className="clip-card__meta">
          <span className="clip-card__views">{formatViews(clip.view_count)} vues</span>
          <span>{formatDate(clip.created_at)}</span>
        </div>
      </div>
    </button>
  );
}
