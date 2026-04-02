'use client';

import { useEffect, useMemo, useState } from 'react';
import ClipCard from '@/app/components/ClipCard';

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

  const visible = sorted.slice(0, page * clipsPerPage);
  const hasMore = sorted.length > visible.length;

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
            {clips !== null && (
              <button className="btn btn--ghost" onClick={onClose}>
                Fermer
              </button>
            )}
          </div>
        </div>
        <div className="clips-grid" id="clipsGrid">
          {clipsLoading ? (
            <p className="clips-empty">Chargement des clips…</p>
          ) : clips === null ? (
            <p className="clips-empty">
              Cliquez sur « Clips » d&apos;un streamer pour afficher ses meilleurs moments Minecraft.
            </p>
          ) : clips.length === 0 ? (
            <p className="clips-empty">Aucun clip Minecraft trouvé.</p>
          ) : (
            visible.map((clip) => <ClipCard key={clip.id} clip={clip} onPlay={onPlayClip} />)
          )}
        </div>
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
