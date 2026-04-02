'use client';

import { useState } from 'react';
import TypeBadge from '@/app/wiki/components/TypeBadge';
import { TYPE_COLORS, TYPE_FR } from '@/lib/data/types';
import { FINAL_EVO, GEN_LABELS, STARTERS_DATA } from '@/lib/data/starters';

export default function Starters() {
  const [filter, setFilter] = useState(null);

  const shown = filter ? STARTERS_DATA.filter((s) => s.types.includes(filter)) : STARTERS_DATA;

  const groups = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map((gen) => ({ gen, label: GEN_LABELS[gen], items: shown.filter((s) => s.gen === gen) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="starters-wrap">
      <div className="starters-header">
        <h2 className="starters-title">Pokémon de départ</h2>
        <p className="starters-desc">
          Choisis ton Pokémon de départ avec <code>/starter</code>. Chaque starter a ses forces et faiblesses.
        </p>
        <div className="starters-filter">
          {[null, 'Grass', 'Fire', 'Water'].map((t) => (
            <button
              key={t ?? 'all'}
              className={`starters-filter__btn${filter === t ? ' active' : ''}`}
              style={t ? { '--fc': TYPE_COLORS[t] } : {}}
              onClick={() => setFilter(t)}
            >
              {t ? TYPE_FR[t] : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {groups.map(({ gen, label, items }) => (
        <div key={gen} className="starters-gen">
          <h3 className="starters-gen__title">
            Génération {gen} — {label}
          </h3>
          <div className="starters-grid">
            {items.map((s) => (
              <div key={s.id} className="starter-card">
                <div className="starter-card__img-wrap">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.id}.png`}
                    alt={s.name}
                    className="starter-card__img"
                    onError={(e) => {
                      e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${s.id}.png`;
                    }}
                  />
                </div>
                <div className="starter-card__name">
                  <span className="starter-card__id">#{String(s.id).padStart(3, '0')}</span>
                  {s.name}
                </div>
                {FINAL_EVO[s.id] && (
                  <div className="starter-card__evo-line">
                    <span className="starter-card__evo-arrow">→</span>
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${FINAL_EVO[s.id].id}.png`}
                      alt={FINAL_EVO[s.id].name}
                      className="starter-card__evo-mini"
                      onError={(e) => {
                        e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${FINAL_EVO[s.id].id}.png`;
                      }}
                    />
                    <span className="starter-card__evo-name">{FINAL_EVO[s.id].name}</span>
                  </div>
                )}
                <div className="starter-card__types">
                  {s.types.map((t) => (
                    <TypeBadge key={t} type={t} small />
                  ))}
                </div>
                <p className="starter-card__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
