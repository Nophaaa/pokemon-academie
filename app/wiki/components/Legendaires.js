'use client';

import { useCallback, useEffect, useState } from 'react';
import TypeBadge from '@/app/wiki/components/TypeBadge';
import {
  COBBL_BIOME_FR,
  COBBL_BUCKET_FR,
  COBBL_CTX_FR,
  COBBL_DIM_FR,
  COBBL_TIME_FR,
  getBiomeEnLabel,
} from '@/lib/data/cobblemon';
import { GEN_COLORS_LEG, GEN_LABELS_LEG, LEGENDARIES_DATA } from '@/lib/data/legendaries';
import { fetchPokemonDetail } from '@/lib/pokemon-api';
import { fetchCobblemonSpawn } from '@/lib/spawn';

export default function Legendaires() {
  const [genFilter, setGenFilter] = useState(0);
  const [mythFilter, setMythFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [legDetail, setLegDetail] = useState(null);
  const [legLoading, setLegLoading] = useState(false);
  const [frNames, setFrNames] = useState({});

  useEffect(() => {
    fetch('/api/pokemon-names-fr')
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setFrNames(data);
      })
      .catch((e) => {
        console.warn('Pokemon API error:', e);
      });
  }, []);

  const gens = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleLegSelect = useCallback(async (entry) => {
    setSelected(entry);
    setLegDetail(null);
    setLegLoading(true);
    try {
      const safeName = entry.name
        .toLowerCase()
        .replace(/[\s:]/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const [detail, spawnRaw] = await Promise.all([fetchPokemonDetail(entry.id), fetchCobblemonSpawn(safeName)]);
      const types = detail?.types?.map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)) ?? [];
      let spawn = null;
      if (spawnRaw && spawnRaw.biomes) {
        const biomes = spawnRaw.biomes
          .map((b) => {
            const fr = COBBL_BIOME_FR[b];
            const en = getBiomeEnLabel(b);
            return fr ? `${fr} (${en})` : en;
          })
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 8);
        const bucket = COBBL_BUCKET_FR[spawnRaw.bucket] || { label: spawnRaw.bucket || '?', color: '#aaa' };
        const context = COBBL_CTX_FR[spawnRaw.context] || spawnRaw.context || null;
        const dims = (spawnRaw.dims || [])
          .map((d) => COBBL_DIM_FR[d] || d.replace(/^[^:]+:/, '').replace(/_/g, ' '))
          .filter((v, i, a) => a.indexOf(v) === i);
        const times = (spawnRaw.times || []).map((t) => COBBL_TIME_FR[t] || t);
        spawn = {
          biomes,
          dims: dims.length ? dims : ['Overworld'],
          times: times.length ? times : ['Toute la journée'],
          raining: spawnRaw.raining || false,
          thunder: spawnRaw.thunder || false,
          level: spawnRaw.level,
          context,
          bucket,
        };
      }
      setLegDetail({ types, spawn });
    } catch (e) {
      console.warn('Pokemon API error:', e);
    } finally {
      setLegLoading(false);
    }
  }, []);

  const filtered = LEGENDARIES_DATA.filter((e) => {
    const matchGen = genFilter === 0 || e.gen === genFilter;
    const matchMyth =
      mythFilter === 'all' || (mythFilter === 'legendary' && !e.mythical) || (mythFilter === 'mythical' && e.mythical);
    return matchGen && matchMyth;
  });

  const grouped = gens
    .map((g) => ({ gen: g, items: filtered.filter((e) => e.gen === g) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="pokedex-wrap">
      <div className="pokedex-header">
        <div className="pokedex-header__info">
          <h2 className="pokedex-title">★ Légendaires & Mythiques</h2>
          <span className="pokedex-count">{filtered.length} Pokémon</span>
        </div>
      </div>
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '14px',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          color: 'var(--text-dim)',
        }}
      >
        <strong style={{ color: '#ffa726' }}>★ Comment trouver des légendaires dans Cobblemon ?</strong>
        <br />
        Ils spawnent naturellement dans des biomes précis avec une rareté{' '}
        <span style={{ color: '#ef5350', fontWeight: 600 }}>ultra-rare</span>. Utilise{' '}
        <code style={{ background: '#ffffff10', padding: '1px 5px', borderRadius: '4px' }}>/checkspawns legendary</code>{' '}
        pour voir ceux disponibles dans ta zone. Un admin peut utiliser{' '}
        <code style={{ background: '#ffffff10', padding: '1px 5px', borderRadius: '4px' }}>/pokespawn &lt;nom&gt;</code>
        .
      </div>

      <div className="pokedex-type-filter" style={{ marginBottom: '6px' }}>
        <button
          className={`pokedex-type-btn${mythFilter === 'all' ? ' active' : ''}`}
          onClick={() => setMythFilter('all')}
        >
          Tous
        </button>
        <button
          className={`pokedex-type-btn${mythFilter === 'legendary' ? ' active' : ''}`}
          style={{ '--ptc': '#ffa726' }}
          onClick={() => setMythFilter('legendary')}
        >
          ★ Légendaires
        </button>
        <button
          className={`pokedex-type-btn${mythFilter === 'mythical' ? ' active' : ''}`}
          style={{ '--ptc': '#9146ff' }}
          onClick={() => setMythFilter('mythical')}
        >
          ✨ Mythiques
        </button>
      </div>
      <div className="pokedex-type-filter" style={{ marginBottom: '16px' }}>
        <button className={`pokedex-type-btn${genFilter === 0 ? ' active' : ''}`} onClick={() => setGenFilter(0)}>
          Toutes gens
        </button>
        {gens.map((g) => (
          <button
            key={g}
            className={`pokedex-type-btn${genFilter === g ? ' active' : ''}`}
            style={{ '--ptc': GEN_COLORS_LEG[g] }}
            onClick={() => setGenFilter(genFilter === g ? 0 : g)}
          >
            Gen {g}
          </button>
        ))}
      </div>

      <div className="pokedex-content">
        <div className="pokedex-grid-panel">
          {grouped.map(({ gen, items }) => (
            <div key={gen} style={{ marginBottom: '24px' }}>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: GEN_COLORS_LEG[gen],
                  marginBottom: '10px',
                  paddingBottom: '6px',
                  borderBottom: `2px solid ${GEN_COLORS_LEG[gen]}44`,
                }}
              >
                Génération {gen} — {GEN_LABELS_LEG[gen]}
              </h3>
              <div className="pokedex-grid">
                {items.map((entry) => (
                  <button
                    key={entry.id}
                    className={`pokedex-card${selected?.id === entry.id ? ' pokedex-card--active' : ''}`}
                    onClick={() => handleLegSelect(entry)}
                  >
                    <div className="pokedex-card__num">#{String(entry.id).padStart(3, '0')}</div>
                    <div className="pokedex-card__img-wrap">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.id}.png`}
                        alt={entry.name}
                        className="pokedex-card__img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`;
                        }}
                      />
                    </div>
                    <div className="pokedex-card__name">{frNames[entry.id] || entry.name}</div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        marginTop: '3px',
                        color: entry.mythical ? '#9146ff' : '#ffa726',
                      }}
                    >
                      {entry.mythical ? '✨ Mythique' : '★ Légendaire'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="wiki-status" style={{ color: 'var(--text-dim)' }}>
              Aucun Pokémon pour ces filtres.
            </p>
          )}
        </div>

        {selected && (
          <div className="pokedex-detail-panel">
            <button className="pokedex-modal__close" onClick={() => setSelected(null)}>
              ✕
            </button>
            <div className="pokedex-modal__img-wrap">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selected.id}.png`}
                alt={selected.name}
                onError={(e) => {
                  e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selected.id}.png`;
                }}
              />
            </div>
            <div className="pokedex-modal__id">#{String(selected.id).padStart(3, '0')}</div>
            <div className="pokedex-modal__name">{frNames[selected.id] || selected.name}</div>

            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: selected.mythical ? '#9146ff22' : '#ffa72622',
                  color: selected.mythical ? '#9146ff' : '#ffa726',
                  border: `1px solid ${selected.mythical ? '#9146ff' : '#ffa726'}`,
                }}
              >
                {selected.mythical ? '✨ Mythique' : '★ Légendaire'}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: GEN_COLORS_LEG[selected.gen] + '22',
                  color: GEN_COLORS_LEG[selected.gen],
                  border: `1px solid ${GEN_COLORS_LEG[selected.gen]}`,
                }}
              >
                Gen {selected.gen} — {GEN_LABELS_LEG[selected.gen]}
              </span>
            </div>

            {legLoading ? (
              <div className="pokedex-modal__loading">
                <span className="stats-spinner"></span>
              </div>
            ) : (
              <>
                {legDetail?.types?.length > 0 && (
                  <div className="pokedex-modal__types">
                    {legDetail.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                )}
                <div className="pokedex-modal__obtain">
                  <div className="pokedex-modal__obtain-title">Comment l'obtenir</div>
                  <div className="pokedex-modal__obtain-rows">
                    <div className="pokedex-obtain-row">
                      <span className="pokedex-obtain-row__label">Méthode</span>
                      <span className="pokedex-obtain-row__val">
                        {selected.mythical ? '✨ Spawn mythique ultra-rare' : '★ Spawn légendaire ultra-rare'}
                      </span>
                    </div>
                    <div className="pokedex-obtain-row">
                      <span className="pokedex-obtain-row__label">Astuce</span>
                      <span className="pokedex-obtain-row__val">{selected.note}</span>
                    </div>
                    {legDetail?.spawn?.context && (
                      <div className="pokedex-obtain-row">
                        <span className="pokedex-obtain-row__label">Contexte</span>
                        <span className="pokedex-obtain-row__val">{legDetail.spawn.context}</span>
                      </div>
                    )}
                    {legDetail?.spawn?.dims?.length > 0 && (
                      <div className="pokedex-obtain-row">
                        <span className="pokedex-obtain-row__label">Dimension</span>
                        <span className="pokedex-obtain-row__val">{legDetail.spawn.dims.join(', ')}</span>
                      </div>
                    )}
                    {legDetail?.spawn?.biomes?.length > 0 && (
                      <div className="pokedex-obtain-row pokedex-obtain-row--col">
                        <span className="pokedex-obtain-row__label">Biomes de spawn</span>
                        <div className="pokedex-biome-list">
                          {legDetail.spawn.biomes.map((b) => (
                            <span key={b} className="pokedex-biome-tag">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {legDetail?.spawn?.times?.length > 0 && (
                      <div className="pokedex-obtain-row">
                        <span className="pokedex-obtain-row__label">Moment</span>
                        <span className="pokedex-obtain-row__val">{legDetail.spawn.times.join(', ')}</span>
                      </div>
                    )}
                    {legDetail?.spawn?.raining && (
                      <div className="pokedex-obtain-row">
                        <span className="pokedex-obtain-row__label">Météo</span>
                        <span className="pokedex-obtain-row__val">🌧 Pluie requise</span>
                      </div>
                    )}
                    {legDetail?.spawn?.bucket && (
                      <div className="pokedex-obtain-row">
                        <span className="pokedex-obtain-row__label">Rareté</span>
                        <span className="pokedex-obtain-row__val" style={{ color: legDetail.spawn.bucket.color }}>
                          {legDetail.spawn.bucket.label}
                        </span>
                      </div>
                    )}
                    {!legDetail?.spawn && (
                      <div className="pokedex-obtain-row">
                        <span className="pokedex-obtain-row__label">Données Cobblemon</span>
                        <span className="pokedex-obtain-row__val" style={{ color: 'var(--text-dim)' }}>
                          Aucune — spawn via admin ou addon.
                        </span>
                      </div>
                    )}
                    <div className="pokedex-obtain-row">
                      <span className="pokedex-obtain-row__label">Commande admin</span>
                      <span
                        className="pokedex-obtain-row__val"
                        style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                      >
                        /pokespawn {selected.name.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
