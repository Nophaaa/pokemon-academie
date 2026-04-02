'use client';

import { useState } from 'react';
import TypeBadge from '@/app/wiki/components/TypeBadge';
import { NATURES, NATURE_STATS } from '@/lib/data/natures';
import { TYPE_COLORS, TYPE_FR, TYPE_GEM, TYPES, getAtkMult, getDefMult } from '@/lib/data/types';

export default function TypeCalculator() {
  const [subTab, setSubTab] = useState('calculateur');
  const [type1, setType1] = useState('Water');
  const [type2, setType2] = useState('');
  const [matrixHighlight, setMatrixHighlight] = useState(null);
  const [natureSearch, setNatureSearch] = useState('');

  const defTypes = [type1, type2].filter(Boolean);

  const results = TYPES.map((atk) => ({ atk, mult: getDefMult(defTypes, atk) }));
  const immune = results.filter((r) => r.mult === 0);
  const x4 = results.filter((r) => r.mult === 4);
  const x2 = results.filter((r) => r.mult === 2);
  const half = results.filter((r) => r.mult === 0.5);
  const quarter = results.filter((r) => r.mult === 0.25);
  const normal = results.filter((r) => r.mult === 1);

  const atkResults = TYPES.map((def) => ({ def, mult: getAtkMult(type1, def) }));
  const atkSuper = atkResults.filter((r) => r.mult >= 2);
  const atkWeak = atkResults.filter((r) => r.mult > 0 && r.mult < 1);
  const atkImmune = atkResults.filter((r) => r.mult === 0);

  const MultGroup = ({ label, items, color, keyProp }) => items.length === 0 ? null : (
    <div className="type-calc__group">
      <div className="type-calc__group-label" style={{ color }}>{label}</div>
      <div className="type-calc__group-types">
        {items.map((r) => <TypeBadge key={r[keyProp || 'atk']} type={r[keyProp || 'atk']} />)}
      </div>
    </div>
  );

  function getMatrixColor(mult) {
    if (mult === 0) return 'var(--type-immune, #2a2a2a)';
    if (mult === 0.25) return 'var(--type-quarter, #1a3a1a)';
    if (mult === 0.5) return 'var(--type-half, #2a4a2a)';
    if (mult === 2) return 'var(--type-x2, #5a2a2a)';
    if (mult === 4) return 'var(--type-x4, #7a1a1a)';
    return 'transparent';
  }

  function getMatrixText(mult) {
    if (mult === 0) return '0';
    if (mult === 0.25) return '¼';
    if (mult === 0.5) return '½';
    if (mult === 2) return '2';
    if (mult === 4) return '4';
    return '';
  }

  return (
    <div className="type-calc-wrap">
      <h2 className="type-calc__title">Système de Types</h2>
      <p className="type-calc__desc">
        Comprends les forces et faiblesses de chaque type pour bâtir la meilleure équipe.
      </p>

      <div className="type-subtabs">
        {[
          { id: 'calculateur', label: 'Calculateur' },
          { id: 'matrice', label: 'Tableau complet' },
          { id: 'natures', label: 'Natures' },
          { id: 'guide', label: 'Guide IV/EV (stats)' },
        ].map((st) => (
          <button
            key={st.id}
            className={`type-subtab${subTab === st.id ? ' type-subtab--active' : ''}`}
            onClick={() => setSubTab(st.id)}
          >
            {st.label}
          </button>
        ))}
      </div>

      {subTab === 'calculateur' && (
        <>
          <div className="type-calc__selectors">
            <div className="type-calc__selector-group">
              <label>Type 1</label>
              <div className="type-buttons">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    className={`type-btn${type1 === t ? ' active' : ''}`}
                    style={{ '--tc': TYPE_COLORS[t] }}
                    onClick={() => setType1(t)}
                    title={TYPE_FR[t]}
                  >
                    <img src={`/cobblemon/type/${TYPE_GEM[t]}.png`} alt={TYPE_FR[t]} className="type-btn__gem" draggable={false} />
                    <span className="type-btn__label">{TYPE_FR[t]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="type-calc__selector-group">
              <label>Type 2 <span className="type-calc__optional">(optionnel)</span></label>
              <div className="type-buttons">
                <button className={`type-btn${type2 === '' ? ' active' : ''}`} style={{ '--tc': '#555' }} onClick={() => setType2('')} title="Aucun">
                  <span className="type-btn__label">Aucun</span>
                </button>
                {TYPES.filter((t) => t !== type1).map((t) => (
                  <button
                    key={t}
                    className={`type-btn${type2 === t ? ' active' : ''}`}
                    style={{ '--tc': TYPE_COLORS[t] }}
                    onClick={() => setType2(t)}
                    title={TYPE_FR[t]}
                  >
                    <img src={`/cobblemon/type/${TYPE_GEM[t]}.png`} alt={TYPE_FR[t]} className="type-btn__gem" draggable={false} />
                    <span className="type-btn__label">{TYPE_FR[t]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="type-calc__preview">
            <div className="type-calc__preview-label">Ton Pokémon :</div>
            <div className="type-calc__preview-types">{defTypes.map((t) => <TypeBadge key={t} type={t} />)}</div>
          </div>

          <div className="type-calc__dual-results">
            <div className="type-calc__panel">
              <h3 className="type-calc__panel-title">En défense</h3>
              <p className="type-calc__panel-hint">Quand ton Pokémon reçoit une attaque</p>
              <div className="type-calc__results">
                <MultGroup label="Immunisé (×0)" items={immune} color="var(--text-dim)" />
                <MultGroup label="Très résistant (×¼)" items={quarter} color="#6bcb77" />
                <MultGroup label="Résistant (×½)" items={half} color="#63bc5a" />
                <MultGroup label="Normal (×1)" items={normal} color="var(--text-dim)" />
                <MultGroup label="Faible (×2)" items={x2} color="#f97176" />
                <MultGroup label="Très faible (×4)" items={x4} color="#ce416b" />
              </div>
            </div>

            <div className="type-calc__panel">
              <h3 className="type-calc__panel-title">En attaque ({TYPE_FR[type1]})</h3>
              <p className="type-calc__panel-hint">Quand ton Pokémon utilise une attaque {TYPE_FR[type1]}</p>
              <div className="type-calc__results">
                <MultGroup label="Inefficace (×0)" items={atkImmune} color="var(--text-dim)" keyProp="def" />
                <MultGroup label="Peu efficace" items={atkWeak} color="#63bc5a" keyProp="def" />
                <MultGroup label="Super efficace" items={atkSuper} color="#f97176" keyProp="def" />
              </div>
            </div>
          </div>

          <div className="type-calc__summary">
            <div className="type-calc__summary-item"><span className="type-calc__summary-num" style={{ color: '#f97176' }}>{x2.length + x4.length}</span><span>faiblesses</span></div>
            <div className="type-calc__summary-item"><span className="type-calc__summary-num" style={{ color: '#63bc5a' }}>{half.length + quarter.length}</span><span>résistances</span></div>
            <div className="type-calc__summary-item"><span className="type-calc__summary-num" style={{ color: 'var(--text-dim)' }}>{immune.length}</span><span>immunités</span></div>
          </div>
        </>
      )}

      {subTab === 'matrice' && (
        <div className="type-matrix-section">
          <p className="type-matrix__legend-text">Lignes = type attaquant, Colonnes = type défenseur. Survole une case pour les détails.</p>
          <div className="type-matrix-scroll">
            <table className="type-matrix">
              <thead>
                <tr>
                  <th className="type-matrix__corner">Atk ↓ / Déf →</th>
                  {TYPES.map((def) => (
                    <th key={def} className={`type-matrix__header${matrixHighlight === def ? ' highlight' : ''}`} style={{ background: TYPE_COLORS[def] }} onMouseEnter={() => setMatrixHighlight(def)} onMouseLeave={() => setMatrixHighlight(null)}>
                      <span className="type-matrix__header-text">{TYPE_FR[def].slice(0, 3)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TYPES.map((atk) => (
                  <tr key={atk}>
                    <td className="type-matrix__row-label" style={{ background: TYPE_COLORS[atk] }}>
                      <img src={`/cobblemon/type/${TYPE_GEM[atk]}.png`} alt="" className="type-matrix__gem" draggable={false} />
                      <span>{TYPE_FR[atk]}</span>
                    </td>
                    {TYPES.map((def) => {
                      const mult = getAtkMult(atk, def);
                      return <td key={def} className={`type-matrix__cell${matrixHighlight === def ? ' highlight' : ''}${mult !== 1 ? ' type-matrix__cell--notable' : ''}`} style={{ background: getMatrixColor(mult) }} title={`${TYPE_FR[atk]} → ${TYPE_FR[def]} : ×${mult}`}>{getMatrixText(mult)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="type-matrix__legend">
            <div className="type-matrix__legend-item"><span className="type-matrix__dot" style={{ background: 'var(--type-x4, #7a1a1a)' }} /> ×4 (très faible)</div>
            <div className="type-matrix__legend-item"><span className="type-matrix__dot" style={{ background: 'var(--type-x2, #5a2a2a)' }} /> ×2 (faible)</div>
            <div className="type-matrix__legend-item"><span className="type-matrix__dot" style={{ background: 'transparent', border: '1px solid var(--border)' }} /> ×1 (normal)</div>
            <div className="type-matrix__legend-item"><span className="type-matrix__dot" style={{ background: 'var(--type-half, #2a4a2a)' }} /> ×½ (résistant)</div>
            <div className="type-matrix__legend-item"><span className="type-matrix__dot" style={{ background: 'var(--type-quarter, #1a3a1a)' }} /> ×¼ (très résistant)</div>
            <div className="type-matrix__legend-item"><span className="type-matrix__dot" style={{ background: 'var(--type-immune, #2a2a2a)' }} /> ×0 (immunisé)</div>
          </div>
        </div>
      )}

      {subTab === 'natures' && (
        <div className="natures-section">
          <p className="natures__desc">Chaque Pokémon a une Nature qui augmente un stat de 10% et en réduit un autre de 10%. Les natures neutres (en gris) n'ont aucun effet.</p>
          <input type="search" className="wiki-search" placeholder="Chercher une nature…" value={natureSearch} onChange={(e) => setNatureSearch(e.target.value)} style={{ maxWidth: '240px', marginBottom: '16px' }} />
          <div className="natures-grid">
            {NATURES.filter((n) => {
              const q = natureSearch.toLowerCase();
              return !q || n.name.toLowerCase().includes(q) || n.en.toLowerCase().includes(q);
            }).map((n) => (
              <div key={n.en} className={`nature-card${!n.up ? ' nature-card--neutral' : ''}`}>
                <div className="nature-card__name">{n.name}</div>
                <div className="nature-card__en">{n.en}</div>
                {n.up ? (
                  <div className="nature-card__stats"><span className="nature-card__up">+{NATURE_STATS[n.up]}</span><span className="nature-card__down">-{NATURE_STATS[n.down]}</span></div>
                ) : <div className="nature-card__stats nature-card__stats--neutral">Neutre</div>}
              </div>
            ))}
          </div>
          <div className="natures-tip">
            <strong>Astuce :</strong> Les natures les plus utilisées en compétitif sont
            <em> Rigide</em> (Adamant, +Atk -AtkS),
            <em> Modeste</em> (Modest, +AtkS -Atk),
            <em> Jovial</em> (Jolly, +Vit -AtkS) et
            <em> Timide</em> (Timid, +Vit -Atk).
          </div>
        </div>
      )}

      {subTab === 'guide' && (
        <div className="ivev-section">
          <div className="ivev-block">
            <h3 className="ivev-block__title">IV — Valeurs Individuelles</h3>
            <p>Chaque Pokémon naît avec 6 IV (un par stat) allant de <strong>0 à 31</strong>. Ils sont permanents et non modifiables.</p>
            <div className="ivev-info-grid">
              <div className="ivev-info-card"><div className="ivev-info-card__title">Vérifier les IV</div><p>Utilise <code>/checkivs</code> ou le PC pour voir les IV de ton Pokémon.</p></div>
              <div className="ivev-info-card"><div className="ivev-info-card__title">Reproduction</div><p>Le <strong>Nœud du Destin</strong> transmet 5 IV des parents au bébé. Combine avec une <strong>Pierrimmobile</strong> pour fixer la nature.</p></div>
              <div className="ivev-info-card"><div className="ivev-info-card__title">IV parfaits</div><p>Un IV de 31 = stat maximisé. Un IV de 0 en Attaque est recherché pour les attaquants spéciaux (réduit les dégâts de confusion).</p></div>
            </div>
          </div>
          <div className="ivev-block">
            <h3 className="ivev-block__title">EV — Valeurs d'Effort</h3>
            <p>Chaque Pokémon peut accumuler jusqu'à <strong>510 EV</strong> au total, et <strong>252 max</strong> par stat. Tous les <strong>4 EV</strong> dans un stat = +1 point au niveau 100.</p>
            <div className="ivev-info-grid">
              <div className="ivev-info-card"><div className="ivev-info-card__title">Gagner des EV</div><p>Chaque Pokémon vaincu donne des EV selon son espèce. Les <strong>Objets Pouvoir</strong> ajoutent +8 EV par combat.</p></div>
              <div className="ivev-info-card"><div className="ivev-info-card__title">Vitamines</div><p>Chaque vitamine (Protéine, Fer, Calcium…) donne <strong>+10 EV</strong>. Plus rapide mais plus cher à crafter.</p></div>
              <div className="ivev-info-card"><div className="ivev-info-card__title">Répartitions courantes</div><p><strong>252/252/4</strong> — Le standard : max 2 stats, 4 dans un 3e. Ex : 252 Atk + 252 Vit + 4 PV pour un sweeper.</p></div>
            </div>
          </div>
          <div className="ivev-block">
            <h3 className="ivev-block__title">Répartitions populaires</h3>
            <div className="ivev-spreads">
              <div className="ivev-spread"><div className="ivev-spread__name">Sweeper Physique</div><div className="ivev-spread__ev">252 Atk / 252 Vit / 4 PV</div><div className="ivev-spread__nature">Nature : Rigide ou Jovial</div></div>
              <div className="ivev-spread"><div className="ivev-spread__name">Sweeper Spécial</div><div className="ivev-spread__ev">252 Atk.Spé / 252 Vit / 4 PV</div><div className="ivev-spread__nature">Nature : Modeste ou Timide</div></div>
              <div className="ivev-spread"><div className="ivev-spread__name">Tank Physique</div><div className="ivev-spread__ev">252 PV / 252 Déf / 4 Déf.Spé</div><div className="ivev-spread__nature">Nature : Assuré ou Relax</div></div>
              <div className="ivev-spread"><div className="ivev-spread__name">Tank Spécial</div><div className="ivev-spread__ev">252 PV / 252 Déf.Spé / 4 Déf</div><div className="ivev-spread__nature">Nature : Calme ou Prudent</div></div>
              <div className="ivev-spread"><div className="ivev-spread__name">Support Mixte</div><div className="ivev-spread__ev">252 PV / 128 Déf / 128 Déf.Spé</div><div className="ivev-spread__nature">Nature : Assuré ou Calme</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
