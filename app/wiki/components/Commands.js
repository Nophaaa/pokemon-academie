'use client';

import { useState } from 'react';
import { COMMANDS } from '@/lib/data/commands';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard
      .writeText(text.split(' ')[0])
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((e) => {
        console.warn('Pokemon API error:', e);
      });
  };
  return (
    <button className="cmd-copy-btn" onClick={handleCopy} title="Copier la commande">
      {copied ? 'Copiée ✓' : 'Copier'}
    </button>
  );
}

export default function Commands() {
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();

  const filtered = COMMANDS.map((section) => ({
    ...section,
    cmds: section.cmds.filter((c) => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)),
  })).filter((s) => s.cmds.length > 0);

  return (
    <div className="commands-wrap">
      <div className="commands-header">
        <div>
          <h2 className="commands-title">Commandes Cobblemon</h2>
          <p className="commands-intro">
            Toutes les commandes disponibles. Les commandes admin nécessitent le niveau opérateur.
          </p>
        </div>
        <input
          type="search"
          className="wiki-search"
          placeholder="Chercher une commande…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '220px' }}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="wiki-status" style={{ color: 'var(--text-dim)' }}>
          Aucune commande pour « {search} »
        </p>
      ) : (
        filtered.map((section) => (
          <div key={section.category} className="commands-section">
            <h3 className="commands-section__title">{section.category}</h3>
            <div className="commands-list">
              {section.cmds.map((c) => (
                <div key={c.cmd} className="command-row">
                  <code className="command-row__cmd">{c.cmd}</code>
                  <span className="command-row__desc">{c.desc}</span>
                  <CopyButton text={c.cmd} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <div className="commands-note">
        <span>💡</span>
        <span>
          Les arguments entre <code>&lt;&gt;</code> sont obligatoires, ceux entre <code>[]</code> sont optionnels.
        </span>
      </div>
    </div>
  );
}
