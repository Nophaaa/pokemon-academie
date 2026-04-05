'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const HOME_QUIZ_POKEMON = [
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
  { id: 9, name: 'Blastoise' },
  { id: 3, name: 'Venusaur' },
  { id: 59, name: 'Arcanine' },
  { id: 65, name: 'Alakazam' },
];

export default function HomeQuiz() {
  const [frNames, setFrNames] = useState({});
  const [current, setCurrent] = useState(null);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [imgReady, setImgReady] = useState(false);
  const [namesLoaded, setNamesLoaded] = useState(false);
  const remainingRef = useRef([]);

  useEffect(() => {
    fetch('/api/pokemon-names-fr')
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setFrNames(data);
        }
        setNamesLoaded(true);
      })
      .catch(() => {
        setNamesLoaded(true);
      });
  }, []);

  const startRound = useCallback(() => {
    if (remainingRef.current.length === 0) {
      remainingRef.current = [...HOME_QUIZ_POKEMON].sort(() => Math.random() - 0.5);
    }
    const answer = remainingRef.current.pop();

    const wrong = [];
    while (wrong.length < 3) {
      const pick = HOME_QUIZ_POKEMON[Math.floor(Math.random() * HOME_QUIZ_POKEMON.length)];
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
    if (namesLoaded) startRound();
  }, [namesLoaded, startRound]);

  const handlePick = (id) => {
    if (revealed) return;
    setPicked(id);
    setRevealed(true);
    setTotal((t) => t + 1);
    if (id === current.id) setScore((s) => s + 1);
  };

  if (!current) {
    return (
      <section className="section home-quiz-section scroll-reveal" id="quiz">
        <div className="section__inner">
          <h2 className="section__title">Qui est ce Pokémon ?</h2>
          <p className="home-quiz__subtitle">Chargement du quiz...</p>
        </div>
      </section>
    );
  }

  const getName = (p) => frNames[p.id] || p.name;

  return (
    <section className="section home-quiz-section scroll-reveal" id="quiz">
      <div className="section__inner">
        <h2 className="section__title">Qui est ce Pokémon ?</h2>
        <p className="home-quiz__subtitle">Identifie le Pokémon à partir de sa silhouette !</p>
        {total > 0 && (
          <div className="home-quiz__score">
            Score : <strong>{score}</strong> / {total}
            <span className="home-quiz__pct"> ({Math.round((score / total) * 100)}%)</span>
          </div>
        )}
        <div className="home-quiz__card">
          <div className="home-quiz__silhouette">
            <img
              key={current.id}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${current.id}.png`}
              alt="Silhouette Pokémon"
              className={`home-quiz__img${imgReady ? ' home-quiz__img--ready' : ''}${revealed ? ' home-quiz__img--revealed' : ''}`}
              draggable={false}
              onLoad={() => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => setImgReady(true));
                });
              }}
              onError={() => setImgReady(true)}
            />
          </div>
          <div className="home-quiz__choices">
            {choices.map((p) => {
              let cls = 'home-quiz__choice';
              if (revealed && p.id === current.id) cls += ' home-quiz__choice--correct';
              else if (revealed && p.id === picked) cls += ' home-quiz__choice--wrong';
              return (
                <button key={p.id} className={cls} onClick={() => handlePick(p.id)} disabled={revealed}>
                  {getName(p)}
                </button>
              );
            })}
          </div>
          {revealed && (
            <div className="home-quiz__result">
              <p className={picked === current.id ? 'home-quiz__result--correct' : 'home-quiz__result--wrong'}>
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
    </section>
  );
}
