'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import Accueil from '@/app/wiki/components/Accueil';

const Commands = dynamic(() => import('@/app/wiki/components/Commands'));
const Crafting = dynamic(() => import('@/app/wiki/components/Crafting'));
const Guide = dynamic(() => import('@/app/wiki/components/Guide'));
const Legendaires = dynamic(() => import('@/app/wiki/components/Legendaires'));
const Pokedex = dynamic(() => import('@/app/wiki/components/Pokedex'));
const Starters = dynamic(() => import('@/app/wiki/components/Starters'));
const TypeCalculator = dynamic(() => import('@/app/wiki/components/TypeCalculator'));
const WikiQuiz = dynamic(() => import('@/app/wiki/components/WikiQuiz'));

const WIKI_SEARCH_TARGETS = [
  { tab: 'pokedex', keywords: ['pokémon', 'pokemon', 'pokédex', 'pokedex', 'sprite', 'stats', 'capture'] },
  {
    tab: 'starters',
    keywords: ['starter', 'départ', 'bulbasaur', 'charmander', 'squirtle', 'bulbizarre', 'salamèche', 'carapuce'],
  },
  {
    tab: 'legendaires',
    keywords: ['légendaire', 'legendaire', 'mythique', 'mewtwo', 'rayquaza', 'arceus', 'dialga', 'palkia'],
  },
  { tab: 'types', keywords: ['type', 'efficacité', 'faiblesse', 'résistance', 'matrice', 'nature', 'iv', 'ev'] },
  {
    tab: 'fabrication',
    keywords: ['craft', 'fabrication', 'recette', 'poké ball', 'pokeball', 'berry', 'baie', 'potion'],
  },
  { tab: 'commandes', keywords: ['commande', 'command', '/pokespawn', '/givepokemon', '/pc', '/pokeheal'] },
  { tab: 'guide', keywords: ['guide', 'débutant', 'tutoriel', 'commencer', 'installer', 'modpack'] },
  { tab: 'quiz', keywords: ['quiz', 'jeu', 'devinette', 'silhouette'] },
];

export default function WikiClient({ tabs }) {
  const [activeTab, setActiveTab] = useState('accueil');
  const [transitionKey, setTransitionKey] = useState(0);
  const [wikiSearch, setWikiSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pa2_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchTab = useCallback((id) => {
    setActiveTab(id);
    setTransitionKey((k) => k + 1);
    setWikiSearch('');
    setSearchResults(null);
  }, []);

  const handleSearch = useCallback(
    (e) => {
      const q = e.target.value;
      setWikiSearch(q);
      if (q.trim().length < 2) {
        setSearchResults(null);
        return;
      }
      const lower = q.trim().toLowerCase();
      const matches = WIKI_SEARCH_TARGETS.filter((t) =>
        t.keywords.some((k) => k.includes(lower) || lower.includes(k)),
      ).map((t) => ({ tab: t.tab, label: tabs.find((tab) => tab.id === t.tab)?.label || t.tab }));
      setSearchResults(matches.length ? matches : []);
    },
    [tabs],
  );

  const activeLabel = tabs.find((t) => t.id === activeTab)?.label || 'Accueil';

  return (
    <div className="wiki-page">
      <header className="wiki-header">
        <div className="wiki-header__left">
          <a href="/" className="wiki-back-btn">
            ← Hub
          </a>
          <div className="wiki-brand">
            <span className="wiki-brand__pokeball" aria-hidden="true" />
            <span className="wiki-brand__title">
              <span className="mc-text mc-text--sm">Cobblemon</span>{' '}
              <span className="mc-text mc-text--sm mc-text--accent">Wiki</span>
            </span>
          </div>
        </div>
        <div className="wiki-header__search">
          <input
            type="search"
            className="wiki-search-input"
            placeholder="Rechercher dans le wiki…"
            value={wikiSearch}
            onChange={handleSearch}
            autoComplete="off"
          />
          {searchResults !== null && (
            <div className="wiki-search-dropdown">
              {searchResults.length === 0 ? (
                <div className="wiki-search-dropdown__empty">Aucun résultat</div>
              ) : (
                searchResults.map((r) => (
                  <button
                    key={r.tab}
                    className="wiki-search-dropdown__item"
                    onClick={() => {
                      switchTab(r.tab);
                    }}
                  >
                    Aller à <strong>{r.label}</strong>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </header>

      <nav className="wiki-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`wiki-tab${activeTab === t.id ? ' wiki-tab--active' : ''}`}
            onClick={() => switchTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="wiki-breadcrumbs">
        <button className="wiki-breadcrumb" onClick={() => switchTab('accueil')}>
          Wiki
        </button>
        <span className="wiki-breadcrumb__sep">/</span>
        <span className="wiki-breadcrumb wiki-breadcrumb--current">{activeLabel}</span>
      </div>

      <main className="wiki-main" key={transitionKey}>
        <div className="wiki-tab-content">
          {activeTab === 'accueil' && <Accueil />}
          {activeTab === 'guide' && <Guide />}
          {activeTab === 'starters' && <Starters />}
          {activeTab === 'pokedex' && <Pokedex />}
          {activeTab === 'legendaires' && <Legendaires />}
          {activeTab === 'types' && <TypeCalculator />}
          {activeTab === 'fabrication' && <Crafting />}
          {activeTab === 'commandes' && <Commands />}
          {activeTab === 'quiz' && <WikiQuiz />}
        </div>
      </main>

      {showScrollTop && (
        <button
          className="scroll-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Remonter en haut"
        >
          ↑
        </button>
      )}

      <footer className="wiki-footer">
        <div className="wiki-footer__content">
          <div className="wiki-footer__block">
            <p>
              <strong>Cobblemon</strong> est développé par l'équipe Cobblemon et distribué sous licence{' '}
              <strong>CCA-BY-NC 4.0</strong> (Creative Commons Attribution-NonCommercial 4.0 International).
            </p>
          </div>
          <div className="wiki-footer__block">
            <p>
              <strong>Pokémon</strong> et tous les noms, personnages et éléments associés sont des marques déposées de{' '}
              <strong>Nintendo / Game Freak / Creatures Inc.</strong> © 1995–2026.
            </p>
          </div>
          <div className="wiki-footer__block">
            <p>
              Ce site est un hub communautaire non officiel pour le modpack <strong>Pokémon Académie 2</strong>. Il
              n'est pas affilié à The Pokémon Company, Nintendo, Game Freak, Creatures Inc. ni à l'équipe Cobblemon.
            </p>
          </div>
          <div className="wiki-footer__block">
            <p>
              Données Pokémon fournies par <strong>PokéAPI</strong> (CC BY-NC 4.0). Sprites et artworks Pokémon ©
              Nintendo / Game Freak. Textures Cobblemon © Cobblemon Team (CCA-BY-NC 4.0).
            </p>
          </div>
          <div className="wiki-footer__block">
            <a href="/politique-de-confidentialite" className="wiki-footer__policy-link">
              Politique de confidentialité
            </a>
            {' · '}
            <a href="/" className="wiki-footer__policy-link">
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
