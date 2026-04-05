'use client';

import { useEffect, useRef } from 'react';
import { formatDate, formatViews } from '@/lib/utils';

export default function ClipPlayerModal({ clip, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!clip) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [clip, onClose]);

  if (!clip) return null;

  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const parents = hostname === 'localhost' ? 'localhost' : hostname;
  const slug = clip.id;

  return (
    <div className="clip-player-modal" role="dialog" aria-modal="true" ref={modalRef}>
      <div className="clip-player-modal__backdrop" onClick={onClose} />
      <div className="clip-player-modal__box">
        <div className="clip-player-modal__header">
          <div className="clip-player-modal__info">
            <div className="clip-player-modal__title">{clip.title || 'Sans titre'}</div>
            <div className="clip-player-modal__meta">
              {clip.broadcaster_name} · {formatViews(clip.view_count)} vues · {formatDate(clip.created_at)}
            </div>
          </div>
          <div className="clip-player-modal__actions">
            <a href={clip.url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
              Ouvrir sur Twitch
            </a>
            <button className="stream-modal__close" onClick={onClose} aria-label="Fermer">
              ✕
            </button>
          </div>
        </div>
        <div className="clip-player-modal__player">
          <iframe
            key={slug}
            src={`https://clips.twitch.tv/embed?clip=${encodeURIComponent(slug)}&parent=${encodeURIComponent(parents)}&autoplay=true`}
            allowFullScreen
            allow="autoplay"
            title={clip.title || 'Clip Twitch'}
          />
        </div>
      </div>
    </div>
  );
}
