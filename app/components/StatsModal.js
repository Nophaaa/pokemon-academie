'use client';

import { useEffect, useRef, useState } from 'react';
import { EVENT_START } from '@/lib/constants';
import { formatDate, formatDuration, formatViews } from '@/lib/utils';
import FallbackAvatar from '@/app/components/FallbackAvatar';

function TopClipPreview({ topClip }) {
  const [thumbError, setThumbError] = useState(false);

  return (
    <a href={topClip.url} target="_blank" rel="noopener noreferrer" className="top-clip-preview">
      <div className="top-clip-preview__thumb-wrap">
        {!thumbError && (
          <img
            src={topClip.thumbnail_url.replace('%{width}', '480').replace('%{height}', '270')}
            alt={topClip.title}
            className="top-clip-preview__thumb"
            onError={() => setThumbError(true)}
          />
        )}
        <div className="clip-card__play" aria-hidden="true"></div>
        <span className="clip-card__duration">{formatDuration(topClip.duration)}</span>
      </div>
      <div className="top-clip-preview__info">
        <div className="top-clip-preview__title">{topClip.title || 'Sans titre'}</div>
        <div className="top-clip-preview__meta">
          <span className="clip-card__views">{formatViews(topClip.view_count)} vues</span>
          <span>{formatDate(topClip.created_at)}</span>
        </div>
      </div>
    </a>
  );
}

export default function StatsModal({ statsModal, onClose }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!statsModal) return;
    previousFocusRef.current = document.activeElement;

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    requestAnimationFrame(() => {
      modalRef.current?.querySelector('[aria-label="Fermer"]')?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKey);
      previousFocusRef.current?.focus();
    };
  }, [statsModal, onClose]);

  useEffect(() => {
    document.body.style.overflow = statsModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [statsModal]);

  if (!statsModal) return null;

  const { user, stats, loading: statsLoading } = statsModal;
  const eventStartLabel = new Date(EVENT_START).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="stats-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Statistiques de ${user?.display_name}`}
      ref={modalRef}
    >
      <div className="stats-modal__backdrop" onClick={onClose}></div>
      <div className="stats-modal__box">
        <div className="stats-modal__header">
          <div className="stats-modal__identity">
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt={user.login} className="stats-modal__avatar" />
            ) : (
              <FallbackAvatar login={user?.login || ''} className="stats-modal__avatar-fallback" />
            )}
            <div>
              <div className="stats-modal__name">{user?.display_name}</div>
              {user?.created_at && (
                <div className="stats-modal__since">
                  Actif depuis{' '}
                  {new Date(user.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </div>
              )}
            </div>
          </div>
          <button className="stream-modal__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {statsLoading ? (
          <div className="stats-modal__loading">
            <span className="stats-spinner"></span>
            Chargement des statistiques…
          </div>
        ) : stats ? (
          <div className="stats-modal__body">
            <div className="stats-modal__event-badge">Depuis le {eventStartLabel}</div>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-card__label">Vues chaîne</span>
                <span className="stat-card__value">{formatViews(user?.view_count || 0)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Clips Minecraft</span>
                <span className="stat-card__value">{stats.clipCount}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Vues clips</span>
                <span className="stat-card__value">{formatViews(stats.totalClipViews)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Streams (VODs)</span>
                <span className="stat-card__value">{stats.vodCount ?? 0}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Heures de stream</span>
                <span className="stat-card__value">{stats.totalStreamH ?? 0}h</span>
              </div>
            </div>

            {stats.topClip && (
              <div className="stats-modal__top-clip">
                <div className="stats-modal__section-title">Meilleur clip Minecraft</div>
                <TopClipPreview topClip={stats.topClip} />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
