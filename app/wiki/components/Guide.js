'use client';

import { useState } from 'react';

/** Render **bold** markdown safely without dangerouslySetInnerHTML */
function renderBold(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

const GUIDE_STEPS = [
  {
    title: '1. Installer le modpack',
    icon: '📦',
    content: [
      'Télécharge le launcher **CurseForge** ou **Modrinth**.',
      'Cherche le modpack **Cobblemon Academy 2.0** et installe-le.',
      "Lance Minecraft avec le profil du modpack. Assure-toi d'avoir au moins **6 Go de RAM** alloués.",
    ],
  },
  {
    title: '2. Rejoindre le serveur',
    icon: '🌐',
    content: [
      "Depuis le menu multijoueur, ajoute l'adresse du serveur fournie par les organisateurs.",
      'Connecte-toi et choisis ton spawn de départ.',
    ],
  },
  {
    title: '3. Choisir ton starter',
    icon: '🎮',
    content: [
      'Dès ton arrivée, un Professeur Pokémon te proposera **3 starters** (Plante, Feu, Eau).',
      "Utilise la commande `/choosestarter` si le dialogue ne s'affiche pas.",
      "Consulte l'onglet **Starters** du wiki pour comparer tous les starters disponibles par génération.",
    ],
  },
  {
    title: '4. Capturer des Pokémon',
    icon: '🔴',
    content: [
      'Affaiblis un Pokémon sauvage en combat puis lance ta Poké Ball.',
      'Les Pokémon apparaissent dans des **biomes spécifiques** — consulte le Pokédex pour les détails.',
    ],
  },
  {
    title: '5. Combattre et progresser',
    icon: '⚔️',
    content: [
      'Les combats se déclenchent automatiquement en lançant ton Pokémon sur un Pokémon sauvage (clic droit avec ton Pokémon en main).',
      "Gagne de l'expérience pour faire monter de niveau et évoluer tes Pokémon.",
      "Utilise les **types** à ton avantage — consulte l'onglet Types pour la table d'efficacité.",
    ],
  },
  {
    title: '6. Fabrication & objets',
    icon: '🔨',
    content: [
      "Fabrique des potions, pierres d'évolution et objets de combat au **Poké Workbench**.",
      'Les **baies** poussent naturellement ou se cultivent — elles soignent et donnent des bonus.',
      'Utilise le **Link Cable** (câble de lien) pour les évolutions par échange.',
    ],
  },
  {
    title: '7. Astuces avancées',
    icon: '💡',
    content: [
      'Les **IV** (Individual Values) déterminent le potentiel de base de chaque stat.',
      'Les **EV** (Effort Values) se gagnent en combattant certains Pokémon.',
      "Les **Natures** modifient les stats de ±10% — consulte l'onglet Types > Natures.",
      "Certains Pokémon n'apparaissent qu'à des **horaires** précis (jour, nuit, aube, crépuscule).",
    ],
  },
];

export default function Guide() {
  const [openStep, setOpenStep] = useState(0);

  return (
    <div className="guide-wrap">
      <div className="guide-hero">
        <h2 className="guide-hero__title">Guide du débutant</h2>
        <p className="guide-hero__desc">
          Tout ce qu'il faut savoir pour bien démarrer sur le modpack Cobblemon Academy 2.0.
        </p>
      </div>
      <div className="guide-steps">
        {GUIDE_STEPS.map((step, i) => (
          <div key={i} className={`guide-step${openStep === i ? ' guide-step--open' : ''}`}>
            <button className="guide-step__header" onClick={() => setOpenStep(openStep === i ? -1 : i)}>
              <span className="guide-step__icon">{step.icon}</span>
              <span className="guide-step__title">{step.title}</span>
              <span className="guide-step__chevron">{openStep === i ? '▲' : '▼'}</span>
            </button>
            {openStep === i && (
              <div className="guide-step__body">
                <ul>
                  {step.content.map((line, j) => (
                    <li key={j}>{renderBold(line)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}