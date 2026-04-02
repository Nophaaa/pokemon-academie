'use client';

import { useCallback, useEffect, useState } from 'react';
import StatBar from '@/app/wiki/components/StatBar';
import TypeBadge from '@/app/wiki/components/TypeBadge';
import { COBBL_BIOME_FR, COBBL_BUCKET_FR, COBBL_CTX_FR, COBBL_DIM_FR, COBBL_TIME_FR, getBiomeEnLabel } from '@/lib/data/cobblemon';
import { EGG_GROUPS_FR, HABITAT_META, HABITATS_FR, getRarity } from '@/lib/data/habitats';
import { describeEvoMethod, fetchEvoChain, fetchPokemonDetail, fetchPokemonSpecies, findChainNode, findEvoDetails, getFlavorText, buildChainPath } from '@/lib/pokemon-api';
import { fetchCobblemonSpawn, parseSpawnData } from '@/lib/spawn';
import { STARTERS_DATA } from '@/lib/data/starters';
import { TYPE_COLORS, TYPE_GEM, TYPES, getDefMult } from '@/lib/data/types';

const STAT_LABELS = {
  hp: 'PV', attack: 'Att', defense: 'Déf',
  'special-attack': 'Att Sp', 'special-defense': 'Déf Sp', speed: 'Vitesse',
};

export default function Pokedex() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evoDetails, setEvoDetails] = useState(null);
  const [nextEvos, setNextEvos] = useState([]);
  const [chainPath, setChainPath] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [cobblSpawn, setCobblSpawn] = useState(null);
  const [habitats, setHabitats] = useState({});
  const [frNames, setFrNames] = useState({});
  const [habitatFilter, setHabitatFilter] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pa2_fav') || '[]'); } catch (e) { console.warn('Pokemon API error:', e); return []; }
  });
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [genFilter, setGenFilter] = useState(0);
  const [compareSlots, setCompareSlots] = useState([null, null]);
  const [compareData, setCompareData] = useState([null, null]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const PER_PAGE = 60;

  const GEN_RANGES = [
    { gen: 1, min: 1, max: 151 }, { gen: 2, min: 152, max: 251 }, { gen: 3, min: 252, max: 386 },
    { gen: 4, min: 387, max: 493 }, { gen: 5, min: 494, max: 649 }, { gen: 6, min: 650, max: 721 },
    { gen: 7, min: 722, max: 809 }, { gen: 8, min: 810, max: 905 }, { gen: 9, min: 906, max: 1025 },
  ];

  const toggleFav = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem('pa2_fav', JSON.stringify(next));
      return next;
    });
  }, []);

  const addToCompare = useCallback(async (p) => {
    setCompareSlots((prev) => {
      if (prev[0]?.id === p.id || prev[1]?.id === p.id) return prev;
      if (!prev[0]) return [p, prev[1]];
      if (!prev[1]) return [prev[0], p];
      return [prev[1], p];
    });
  }, []);

  useEffect(() => {
    if (!compareSlots[0] || !compareSlots[1]) { setCompareData([null, null]); return; }
    let cancelled = false;
    setCompareLoading(true);
    Promise.all(compareSlots.map(async (p) => {
      const [d, spawn] = await Promise.all([fetchPokemonDetail(p.id), fetchCobblemonSpawn(p.name.toLowerCase())]);
      return { pokemon: p, detail: d, spawn };
    })).then((results) => {
      if (!cancelled) { setCompareData(results); setCompareLoading(false); }
    }).catch((e) => {
      console.warn('Pokemon API error:', e);
      if (!cancelled) setCompareLoading(false);
    });
    return () => { cancelled = true; };
  }, [compareSlots]);

  useEffect(() => {
    fetch('/api/pokedex').then((r) => r.json()).then((data) => { if (data.error) throw new Error(data.error); setPokemon(data); }).catch((e) => setError(e.message)).finally(() => setLoading(false));
    fetch('/api/habitats').then((r) => r.json()).then((data) => { if (!data.error) setHabitats(data); }).catch((e) => { console.warn('Pokemon API error:', e); });
    fetch('/api/pokemon-names-fr').then((r) => r.json()).then((data) => { if (!data.error) setFrNames(data); }).catch((e) => { console.warn('Pokemon API error:', e); });
  }, []);

  const handleSelect = useCallback(async (p) => {
    setSelected(p);
    setDetail(null);
    setSpecies(null);
    setEvoDetails(null);
    setNextEvos([]);
    setChainPath([]);
    setCobblSpawn(null);
    setDetailLoading(true);
    try {
      const [d, s, spawnRaw] = await Promise.all([fetchPokemonDetail(p.id), fetchPokemonSpecies(p.id), fetchCobblemonSpawn(p.name.toLowerCase())]);
      setDetail(d);
      setSpecies(s);
      if (spawnRaw && spawnRaw.biomes) {
        const biomes = spawnRaw.biomes.map((b) => {
          const fr = COBBL_BIOME_FR[b];
          const en = getBiomeEnLabel(b);
          return fr ? `${fr} (${en})` : en;
        }).filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);
        const bucket = COBBL_BUCKET_FR[spawnRaw.bucket] || { label: spawnRaw.bucket || '?', color: '#aaa' };
        const context = COBBL_CTX_FR[spawnRaw.context] || spawnRaw.context || null;
        const dims = (spawnRaw.dims || []).map((d0) => COBBL_DIM_FR[d0] || d0.replace(/^[^:]+:/, '').replace(/_/g, ' ')).filter((v, i, a) => a.indexOf(v) === i);
        const times = (spawnRaw.times || []).map((t) => COBBL_TIME_FR[t] || t);
        setCobblSpawn({ biomes, dims: dims.length ? dims : ['Overworld'], times: times.length ? times : ['Toute la journée'], raining: spawnRaw.raining || false, thunder: spawnRaw.thunder || false, level: spawnRaw.level, context, bucket });
      } else {
        setCobblSpawn(spawnRaw ? parseSpawnData(spawnRaw) : null);
      }
      if (s?.evolution_chain?.url) {
        const chain = await fetchEvoChain(s.evolution_chain.url);
        if (chain) {
          setEvoDetails(findEvoDetails(chain.chain, p.name.toLowerCase()) ?? null);
          const node = findChainNode(chain.chain, p.name.toLowerCase());
          setNextEvos(node?.evolves_to ?? []);
          setChainPath(buildChainPath(chain.chain, p.name.toLowerCase()));
        }
      }
    } catch (e) {
      console.warn('Pokemon API error:', e);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const capitalizeType = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const filtered = pokemon.filter((p) => {
    const q = search.toLowerCase();
    const frName = (frNames[p.id] || '').toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || String(p.id).includes(q) || frName.includes(q);
    const matchType = !typeFilter || (p.types || []).includes(typeFilter);
    const matchHabitat = !habitatFilter || habitats[p.id] === habitatFilter;
    const matchFav = !showFavOnly || favorites.includes(p.id);
    const matchGen = !genFilter || GEN_RANGES.some((g) => g.gen === genFilter && p.id >= g.min && p.id <= g.max);
    return matchSearch && matchType && matchHabitat && matchFav && matchGen;
  });
  const visible = filtered.slice(0, (page + 1) * PER_PAGE);
  const detailTypes = detail?.types?.map((t) => capitalizeType(t.type.name)) || [];

  if (loading) return <div className="wiki-status"><span className="stats-spinner"></span>Chargement du Pokédex…</div>;
  if (error) return <div className="wiki-status wiki-status--error">⚠ {error}</div>;

  const flavorText = species ? getFlavorText(species.flavor_text_entries) : null;
  const habitat = species?.habitat ? HABITATS_FR[species.habitat.name] || species.habitat.name : null;
  const rarity = species ? getRarity(species.capture_rate) : null;
  const evolvesFrom = species?.evolves_from_species?.name ? species.evolves_from_species.name.charAt(0).toUpperCase() + species.evolves_from_species.name.slice(1) : null;
  const isStarter = selected ? STARTERS_DATA.some((s) => s.id === selected.id) : false;
  const isLegendary = species?.is_legendary ?? false;
  const isMythical = species?.is_mythical ?? false;
  const evoMethod = describeEvoMethod(evoDetails);
  const eggGroups = (species?.egg_groups ?? []).map((g) => EGG_GROUPS_FR[g.name] || g.name).filter((g) => g !== 'Sans œuf');

  return (
    <div className="pokedex-wrap">
      <div className="pokedex-header">
        <div className="pokedex-header__info"><h2 className="pokedex-title">Pokédex Cobblemon</h2><span className="pokedex-count">{filtered.length} Pokémon{search ? ` pour « ${search} »` : ''}</span></div>
        <input className="wiki-search" type="search" placeholder="Nom ou numéro…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} style={{ maxWidth: '200px' }} />
      </div>

      <div className="pokedex-type-filter">
        <button className={`pokedex-type-btn${typeFilter === '' ? ' active' : ''}`} onClick={() => { setTypeFilter(''); setPage(0); }}>Tous</button>
        {TYPES.map((t) => <button key={t} className={`pokedex-type-btn${typeFilter === t ? ' active' : ''}`} style={{ '--ptc': TYPE_COLORS[t] }} onClick={() => { setTypeFilter(typeFilter === t ? '' : t); setPage(0); }}>{t}</button>)}
      </div>

      {Object.keys(habitats).length > 0 && (
        <div className="pokedex-type-filter" style={{ marginTop: '6px' }}>
          <button className={`pokedex-type-btn${habitatFilter === '' ? ' active' : ''}`} onClick={() => { setHabitatFilter(''); setPage(0); }}>Tous biomes</button>
          {Object.keys(HABITAT_META).map((h) => {
            const meta = HABITAT_META[h];
            return <button key={h} className={`pokedex-type-btn${habitatFilter === h ? ' active' : ''}`} style={{ '--ptc': meta.color }} onClick={() => { setHabitatFilter(habitatFilter === h ? '' : h); setPage(0); }}>{meta.icon} {meta.label}</button>;
          })}
        </div>
      )}

      <div className="pokedex-adv-filters">
        <div className="pokedex-type-filter" style={{ marginTop: '6px' }}>
          <button className={`pokedex-type-btn${genFilter === 0 ? ' active' : ''}`} onClick={() => { setGenFilter(0); setPage(0); }}>Toutes gén.</button>
          {GEN_RANGES.map((g) => <button key={g.gen} className={`pokedex-type-btn${genFilter === g.gen ? ' active' : ''}`} onClick={() => { setGenFilter(genFilter === g.gen ? 0 : g.gen); setPage(0); }}>Gen {g.gen}</button>)}
        </div>
        <div className="pokedex-quick-actions">
          <button className={`pokedex-fav-toggle${showFavOnly ? ' active' : ''}`} onClick={() => { setShowFavOnly(!showFavOnly); setPage(0); }} title={showFavOnly ? 'Voir tous' : 'Voir favoris'}>{showFavOnly ? '★' : '☆'} Favoris{favorites.length > 0 ? ` (${favorites.length})` : ''}</button>
          <button className={`pokedex-compare-toggle${showCompare ? ' active' : ''}`} onClick={() => setShowCompare(!showCompare)}>⚖ Comparer</button>
        </div>
      </div>

      {showCompare && (
        <div className="pokedex-compare">
          <div className="pokedex-compare__header"><h3>Comparateur</h3><span className="pokedex-compare__hint">Clique sur « + Comparer » sur les cartes pour ajouter</span></div>
          <div className="pokedex-compare__slots">
            {[0, 1].map((i) => (
              <div key={i} className={`pokedex-compare__slot${compareSlots[i] ? ' filled' : ''}`}>
                {compareSlots[i] ? (
                  <>
                    <button className="pokedex-compare__remove" onClick={() => { setCompareSlots((s) => { const n = [...s]; n[i] = null; return n; }); }}>✕</button>
                    <img src={compareSlots[i].sprite} alt={compareSlots[i].name} className="pokedex-compare__sprite" onError={(e) => { e.currentTarget.src = compareSlots[i].fallback; }} />
                    <span className="pokedex-compare__name">{frNames[compareSlots[i].id] || compareSlots[i].name}</span>
                  </>
                ) : <span className="pokedex-compare__empty">Slot {i + 1}</span>}
              </div>
            ))}
          </div>
          {compareSlots[0] && compareSlots[1] && (
            compareLoading ? <div className="pokedex-compare__loading"><span className="stats-spinner"></span> Chargement…</div> : compareData[0] && compareData[1] && (
              <div className="pokedex-compare__results">
                <table className="pokedex-compare__table">
                  <thead><tr><th>Stat</th><th>{frNames[compareData[0].pokemon.id] || compareData[0].pokemon.name}</th><th>{frNames[compareData[1].pokemon.id] || compareData[1].pokemon.name}</th></tr></thead>
                  <tbody>
                    {compareData[0].detail?.stats?.map((s, idx) => {
                      const v0 = s.base_stat;
                      const v1 = compareData[1].detail?.stats?.[idx]?.base_stat ?? 0;
                      return <tr key={s.stat.name}><td className="pokedex-compare__stat-name">{STAT_LABELS[s.stat.name] || s.stat.name}</td><td className={v0 > v1 ? 'compare-win' : v0 < v1 ? 'compare-lose' : ''}>{v0}</td><td className={v1 > v0 ? 'compare-win' : v1 < v0 ? 'compare-lose' : ''}>{v1}</td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}

      <div className="pokedex-content">
        <div className="pokedex-grid-panel">
          <div className="pokedex-grid">
            {visible.map((p) => {
              const hab = habitats[p.id] ? HABITAT_META[habitats[p.id]] : null;
              const isFav = favorites.includes(p.id);
              return (
                <div key={p.id} className={`pokedex-card-wrap${selected?.id === p.id ? ' pokedex-card-wrap--active' : ''}`}>
                  <button className="pokedex-card__fav" onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }} title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}>{isFav ? '★' : '☆'}</button>
                  <button className={`pokedex-card${selected?.id === p.id ? ' pokedex-card--active' : ''}`} onClick={() => handleSelect(p)} style={{ '--type-color': TYPE_COLORS[p.types?.[0]] || 'var(--accent)' }}>
                    <div className="pokedex-card__num">#{String(p.id).padStart(3, '0')}</div>
                    <div className="pokedex-card__img-wrap"><img src={p.sprite} alt={p.name} className="pokedex-card__img" loading="lazy" onError={(e) => { e.currentTarget.src = p.fallback; }} /></div>
                    <div className="pokedex-card__name">{frNames[p.id] || p.name}</div>
                    {p.types?.length > 0 && <div className="pokedex-card__types">{p.types.map((t) => <TypeBadge key={t} type={t} small />)}</div>}
                    {hab && <div style={{ fontSize: '0.78rem', color: hab.color, marginTop: '4px', opacity: 0.9, fontWeight: 600 }}>{hab.icon} {hab.label}</div>}
                  </button>
                  {showCompare && <button className="pokedex-card__compare-btn" onClick={(e) => { e.stopPropagation(); addToCompare(p); }} title="Ajouter au comparateur">+ Comparer</button>}
                </div>
              );
            })}
          </div>
          {visible.length < filtered.length && <div className="pokedex-more"><button className="btn btn--ghost" onClick={() => setPage((p) => p + 1)}>Charger plus ({filtered.length - visible.length} restants)</button></div>}
        </div>

        {selected && (
          <div className="pokedex-detail-panel" style={detailTypes.length > 0 ? { background: `linear-gradient(170deg, ${TYPE_COLORS[detailTypes[0]] || '#555'}28 0%, var(--bg-card) 45%, ${TYPE_COLORS[detailTypes[1] || detailTypes[0]] || '#555'}14 100%)`, borderTop: `3px solid ${TYPE_COLORS[detailTypes[0]] || 'var(--accent)'}` } : {}}>
            <button className="pokedex-modal__close" onClick={() => setSelected(null)}>✕</button>
            <div className="poke-card-header">
              <div className="poke-card-header__left"><span className="poke-card-header__num">#{String(selected.id).padStart(3, '0')}</span>{(isLegendary || isMythical) && <span className="poke-card-header__badge">{isMythical ? '✨' : '★'}</span>}</div>
              <div className="poke-card-header__name">{frNames[selected.id] || selected.name}</div>
              <div className="poke-card-header__hp">{!detailLoading && detail && <><span>PV {detail.stats[0]?.base_stat}</span>{detailTypes[0] && <img src={`/cobblemon/type/${TYPE_GEM[detailTypes[0]]}.png`} alt={detailTypes[0]} className="poke-card-header__type-gem" />}</>}</div>
            </div>
            <div className="poke-card-artwork" style={detailTypes[0] ? { background: `radial-gradient(ellipse at 50% 60%, ${TYPE_COLORS[detailTypes[0]] || '#555'}33 0%, transparent 70%)` } : {}}><img src={selected.sprite} alt={frNames[selected.id] || selected.name} className="poke-card-artwork__img" onError={(e) => { e.currentTarget.src = selected.fallback; }} /></div>
            {detailTypes.length > 0 && <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>{detailTypes.map((t) => <TypeBadge key={t} type={t} />)}</div>}
            {detailLoading && <div className="pokedex-modal__loading"><span className="stats-spinner"></span></div>}
            {!detailLoading && detail && (
              <>
                {flavorText && <p className="poke-card-flavor">{flavorText}</p>}
                <div className="poke-card-section">
                  <div className="poke-card-section__title">Comment l'obtenir</div>
                  <div className="poke-card-obtain">
                    <div className="poke-card-obtain__row"><span className="poke-card-obtain__icon">🎯</span><span className="poke-card-obtain__label">Méthode</span><span className="poke-card-obtain__val">{isStarter ? '⭐ Commande /starter' : isMythical ? '✨ Spawn mythique' : isLegendary ? '★ Spawn légendaire rare' : evolvesFrom ? `Évoluer ${evolvesFrom}${evoMethod ? ` — ${evoMethod}` : ''}` : 'Capture dans la nature'}</span></div>
                    {(cobblSpawn?.biomes?.length > 0 || habitat) && <div className="poke-card-obtain__row poke-card-obtain__row--col"><div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><span className="poke-card-obtain__icon">📍</span><span className="poke-card-obtain__label">Biomes</span></div><div className="pokedex-biome-list" style={{ marginTop: '6px' }}>{cobblSpawn?.biomes?.length > 0 ? cobblSpawn.biomes.map((b) => <span key={b} className="pokedex-biome-tag">{b}</span>) : <span className="pokedex-biome-tag">{habitat}</span>}</div></div>}
                    {eggGroups.length > 0 && <div className="poke-card-obtain__row"><span className="poke-card-obtain__icon">🥚</span><span className="poke-card-obtain__label">Élevage</span><span className="poke-card-obtain__val">Groupe {eggGroups.join(' / ')}</span></div>}
                    {(cobblSpawn?.bucket || (!cobblSpawn && rarity)) && <div className="poke-card-obtain__row"><span className="poke-card-obtain__icon">⭐</span><span className="poke-card-obtain__label">Rareté</span><span className="poke-card-obtain__val" style={{ color: cobblSpawn?.bucket?.color || rarity?.color }}>{cobblSpawn?.bucket?.label || rarity?.label}</span></div>}
                  </div>
                </div>
                <div className="poke-card-section"><div className="poke-card-section__title">Statistiques de base</div><div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>{detail.stats.map((s, i) => <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} index={i} />)}</div></div>
                {detailTypes.length > 0 && (() => {
                  const weak = TYPES.filter((t) => getDefMult(detailTypes, t) >= 2);
                  const immune = TYPES.filter((t) => getDefMult(detailTypes, t) === 0);
                  return <div className="poke-card-footer">{weak.length > 0 && <div className="poke-card-footer__row"><span className="poke-card-footer__label">Faiblesse</span><div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>{weak.map((t) => <TypeBadge key={t} type={t} small />)}</div></div>}{immune.length > 0 && <div className="poke-card-footer__row"><span className="poke-card-footer__label">Immunité</span><div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>{immune.map((t) => <TypeBadge key={t} type={t} small />)}</div></div>}</div>;
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
