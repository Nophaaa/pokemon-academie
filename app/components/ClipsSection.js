'use client';

import { useEffect, useMemo, useState } from 'react';
import ClipCard from '@/app/components/ClipCard';
import { formatDate, formatDuration, formatViews } from '@/lib/utils';

function FeaturedClip({ clip, onPlay }) {
  const [thumbError, setThumbError] = useState(false);
  const thumbUrl = clip.thumbnail_url
    ? clip.thumbnail_url.replace('%{width}', '640').replace('%{height}', '360')
    : null;

  return (
    <button className="featured-clip" onClick={() => onPlay(clip)}>
      <div className="featured-clip__thumb-wrap">
        {thumbUrl && !thumbError && (
          <img
            src={thumbUrl}
            alt={clip.title || 'Clip'}
            className="featured-clip__thumb"
            onError={() => setThumbError(true)}
          />
        )}
        <div className="featured-clip__overlay">
          <div className="featured-clip__play-icon" aria-hidden="true" />
          <span className="featured-clip__badge">CLIP LE PLUS VU</span>
        </div>
      </div>
      <div className="featured-clip__info">
        <div className="featured-clip__title">{clip.title || 'Sans titre'}</div>
        <div className="featured-clip__meta">
          <span className="featured-clip__streamer">{clip.broadcaster_name}</span>
          <span className="featured-clip__views">{formatViews(clip.view_count)} vues</span>
          <span className="featured-clip__duration">{formatDuration(clip.duration)}</span>
          <span>{formatDate(clip.created_at)}</span>
        </div>
      </div>
    </button>
  );
}

export default function ClipsSection({
  clips,
  clipsTitle,
  clipsLoading,
  onClose,
  onLoadAll,
  allClipsLoading,
  onPlayClip,
  clipsPerPage,
  sectionRef,
}) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('date');

  useEffect(() => {
    setPage(1);
  }, [clips]);

  const sorted = useMemo(() => {
    if (!clips) return [];
    return [...clips].sort((a, b) => {
      if (sort === 'views') return (b.view_count || 0) - (a.view_count || 0);
      if (sort === 'duration') return (b.duration || 0) - (a.duration || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [clips, sort]);

  const topClip = useMemo(() => {
    if (!clips || clips.length === 0) return null;
    return [...clips].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0];
  }, [clips]);

  const restClips = useMemo(() => {
    if (!topClip) return sorted;
    return sorted.filter((c) => c.id !== topClip.id);
  }, [sorted, topClip]);

  const visible = restClips.slice(0, page * clipsPerPage);
  const hasMore = restClips.length > visible.length;

  return (
    <section className="section clips-section" id="clips" ref={sectionRef}>
      <div className="section__inner">
        <div className="clips-header">
          <h2 className="section__title">{clipsTitle}</h2>
          <div className="clips-header__actions">
            {clips !== null && clips.length > 0 && (
              <select
                className="clips-sort"
                aria-label="Trier les clips par"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="date">Plus récents</option>
                <option value="views">Plus vus</option>
                <option value="duration">Plus longs</option>
              </select>
            )}
            <button className="btn btn--purple" onClick={onLoadAll} disabled={allClipsLoading}>
              {allClipsLoading ? 'Chargement…' : 'Tous les clips'}
            </button>
            {clips !== null && clipsTitle !== 'Tous les clips — Minecraft' && (
              <button className="btn btn--ghost" onClick={onClose}>
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {clipsLoading ? (
          <p className="clips-empty">Chargement des clips…</p>
        ) : clips === null || clips.length === 0 ? (
          <p className="clips-empty">
            {clips === null ? 'Chargement des clips…' : 'Aucun clip Minecraft trouvé.'}
          </p>
        ) : (
          <>
            {topClip && <FeaturedClip clip={topClip} onPlay={onPlayClip} />}
            <div className="clips-grid" id="clipsGrid">
              {visible.map((clip) => (
                <ClipCard key={clip.id} clip={clip} onPlay={onPlayClip} />
              ))}
            </div>
          </>
        )}

        {hasMore && (
          <div className="clips-loadmore">
            <button className="btn btn--ghost" onClick={() => setPage((p) => p + 1)}>
              Charger plus
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
