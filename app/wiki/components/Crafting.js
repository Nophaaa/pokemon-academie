'use client';

import { useMemo, useState } from 'react';
import { CRAFTING_ITEMS, MC_ITEMS, RECIPES } from '@/lib/data/crafting';

function McItem({ id }) {
  const [failed, setFailed] = useState(false);
  if (!id) return <div className="craft-slot craft-slot--empty" />;
  const item = MC_ITEMS[id] || { name: id, tex: null, bg: '#444' };
  const showImage = Boolean(item.tex) && !failed;

  return (
    <div
      className="craft-slot craft-slot--filled"
      style={{ background: showImage ? '#3a3a3a' : item.bg }}
      title={item.name}
    >
      {showImage ? (
        <img src={item.tex} alt={item.name} className="craft-slot__img" onError={() => setFailed(true)} />
      ) : (
        <span className="craft-slot__abbr">{item.name.slice(0, 5)}</span>
      )}
      <span className="craft-slot__tooltip">{item.name}</span>
    </div>
  );
}

function CraftingGrid({ grid, result }) {
  const resultItem = MC_ITEMS[result] || { name: result, tex: null, bg: '#555' };
  const [resultImgFailed, setResultImgFailed] = useState(false);
  const showResultImage = Boolean(resultItem.tex) && !resultImgFailed;

  return (
    <div className="craft-recipe">
      <div className="craft-grid">
        {grid.map((slot, i) => (
          <McItem key={i} id={slot} />
        ))}
      </div>
      <div className="craft-arrow">→</div>
      <div
        className="craft-result"
        style={{ background: showResultImage ? '#3a3a3a' : resultItem.bg }}
        title={resultItem.name}
      >
        {showResultImage ? (
          <img
            src={resultItem.tex}
            alt={resultItem.name}
            className="craft-result__img"
            onError={() => setResultImgFailed(true)}
          />
        ) : null}
        <span className="craft-result__label" style={{ display: showResultImage ? 'none' : 'block' }}>
          {resultItem.name}
        </span>
        <span className="craft-slot__tooltip">{resultItem.name}</span>
      </div>
    </div>
  );
}

export default function Crafting() {
  const [selectedId, setSelectedId] = useState('balls');
  const [failedNav, setFailedNav] = useState({});
  const recipe = RECIPES[selectedId];
  const isFailed = useMemo(() => (id) => Boolean(failedNav[id]), [failedNav]);

  return (
    <div className="crafting-wrap">
      <aside className="crafting-sidebar">
        <p className="crafting-sidebar__title">Catégories</p>
        {CRAFTING_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`crafting-nav-item${selectedId === item.id ? ' crafting-nav-item--active' : ''}`}
            onClick={() => setSelectedId(item.id)}
          >
            <span className="crafting-nav-item__icon">
              {item.tex && !isFailed(item.id) && (
                <img
                  src={item.tex}
                  alt={item.name}
                  className="crafting-nav-item__img"
                  onError={() => setFailedNav((prev) => ({ ...prev, [item.id]: true }))}
                />
              )}
            </span>
            <div>
              <div className="crafting-nav-item__name">{item.name}</div>
              <div className="crafting-nav-item__desc">{item.desc}</div>
            </div>
          </button>
        ))}
      </aside>
      <div className="crafting-content">
        <h2 className="craft-category-title">{recipe.title}</h2>
        <p className="craft-category-desc">{recipe.desc}</p>
        <div className="craft-items">
          {recipe.items.map((item) => (
            <div key={item.name} className="craft-item">
              <h3 className="craft-item__name">{item.name}</h3>
              <CraftingGrid grid={item.grid} result={item.result || item.name} />
              <p className="craft-item__notes">{item.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
