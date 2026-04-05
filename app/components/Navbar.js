'use client';

import { useState } from 'react';

export default function Navbar({ onRefresh, refreshing, theme, onToggleTheme, countdown }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar__brand">Pokémon Académie 2</div>
      <ul className={`navbar__links${menuOpen ? ' open' : ''}`}>
        <li>
          <a href="#accueil" onClick={closeMenu}>
            Accueil
          </a>
        </li>
        <li>
          <a href="#streamers" onClick={closeMenu}>
            Streamers
          </a>
        </li>
        <li>
          <a href="#clips" onClick={closeMenu}>
            Clips
          </a>
        </li>
        <li>
          <a href="/wiki">Wiki</a>
        </li>
      </ul>
      <div className="navbar__actions">
        {countdown && <span className="refresh-countdown">{countdown}</span>}
        <button className="btn btn--ghost theme-toggle" onClick={onToggleTheme} title="Changer de thème">
          {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        </button>
      </div>
      <button
        className="navbar__burger"
        aria-label="Menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}
