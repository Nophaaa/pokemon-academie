'use client';

import { useCallback, useEffect, useState } from 'react';

const QUIZ_POKEMON = [
  { id: 25, name: 'Pikachu' },
  { id: 1, name: 'Bulbasaur' },
  { id: 6, name: 'Charizard' },
  { id: 39, name: 'Jigglypuff' },
  { id: 94, name: 'Gengar' },
  { id: 131, name: 'Lapras' },
  { id: 143, name: 'Snorlax' },
  { id: 150, name: 'Mewtwo' },
  { id: 133, name: 'Eevee' },
  { id: 249, name: 'Lugia' },
  { id: 384, name: 'Rayquaza' },
  { id: 448, name: 'Lucario' },
  { id: 658, name: 'Greninja' },
  { id: 282, name: 'Gardevoir' },
  { id: 376, name: 'Metagross' },
  { id: 445, name: 'Garchomp' },
  { id: 130, name: 'Gyarados' },
  { id: 149, name: 'Dragonite' },
  { id: 248, name: 'Tyranitar' },
  { id: 373, name: 'Salamence' },
  { id: 475, name: 'Gallade' },
  { id: 609, name: 'Chandelure' },
  { id: 635, name: 'Hydreigon' },
  { id: 706, name: 'Goodra' },
  { id: 812, name: 'Rillaboom' },
  { id: 815, name: 'Cinderace' },
  { id: 818, name: 'Inteleon' },
  { id: 887, name: 'Dragapult' },
  { id: 9, name: 'Blastoise' },
  { id: 3, name: 'Venusaur' },
  { id: 59, name: 'Arcanine' },
  { id: 65, name: 'Alakazam' },
  { id: 68, name: 'Machamp' },
  { id: 76, name: 'Golem' },
  { id: 112, name: 'Rhydon' },
  { id: 121, name: 'Starmie' },
  { id: 134, name: 'Vaporeon' },
  { id: 135, name: 'Jolteon' },
  { id: 136, name: 'Flareon' },
  { id: 196, name: 'Espeon' },
];

export default function WikiQuiz() {
  const [frNames, setFrNames] = useState({});
  const [current, setCurrent] = useState(null);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [imgReady, setImgReady] = useState(false);

  useEffect(() => {
    fetch('/api/pokemon-names-fr')
      .then((r) => r.json())
      .then(setFrNames)
      .catch((e) => {
        console.warn('Pokemon API error:', e);
      });
  }, []);

  const startRound = useCallback(() => {
    const available = QUIZ_POKEMON.length;
    const answer = QUIZ_POKEMON[Math.floor(Math.random() * available)];
    const wrong = [];
    while (wrong.length < 3) {
      const pick = QUIZ_POKEMON[Math.floor(Math.random() * available)];
      if (pick.id !== answer.id && !wrong.find((w) => w.id === pick.id)) wrong.push(pick);
    }
    const all = [answer, ...wrong].sort(() => Math.random() - 0.5);
    setCurrent(answer);
    setChoices(all);
    setPicked(null);
    setRevealed(false);
    setImgReady(false);
  }, []);

  useEffect(() => {
    startRound();
  }, [startRound]);

  const handlePick = (id) => {
    if (revealed) return;
    setPicked(id);
    setRevealed(true);
    setTotal((t) => t + 1);
    if (id === current.id) setScore((s) => s + 1);
  };

  if (!current) return null;
  const getName = (p) => frNames[p.id] || p.name;

  return (
    <div className="quiz-wrap">
      <div className="quiz-hero">
        <h2 className="quiz-hero__title">Qui est ce Pokémon ?</h2>
        <p className="quiz-hero__desc">Identifie le Pokémon à partir de sa silhouette !</p>
        <div className="quiz-score">
          Score : <strong>{score}</strong> / {total}
          {total > 0 && <span className="quiz-score__pct"> ({Math.round((score / total) * 100)}%)</span>}
        </div>
      </div>
      <div className="quiz-card">
        <div className="quiz-card__silhouette">
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${current.id}.png`}
            alt="Silhouette Pokémon"
            className={`quiz-card__img${imgReady ? ' quiz-card__img--ready' : ''}${revealed ? ' quiz-card__img--revealed' : ''}`}
            draggable={false}
            onLoad={() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => setImgReady(true));
              });
            }}
          />
        </div>
        <div className="quiz-card__choices">
          {choices.map((p) => {
            let cls = 'quiz-choice';
            if (revealed && p.id === current.id) cls += ' quiz-choice--correct';
            else if (revealed && p.id === picked) cls += ' quiz-choice--wrong';
            return (
              <button key={p.id} className={cls} onClick={() => handlePick(p.id)} disabled={revealed}>
                {getName(p)}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="quiz-card__result">
            <p className={picked === current.id ? 'quiz-result--correct' : 'quiz-result--wrong'}>
              {picked === current.id ? "Bravo ! C'est bien " : "Raté ! C'était "}
              <strong>{getName(current)}</strong> !
            </p>
            <button className="btn btn--purple" onClick={startRound}>
              Pokémon suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
