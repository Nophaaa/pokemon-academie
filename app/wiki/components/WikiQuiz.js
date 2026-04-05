'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const QUIZ_POKEMON = [
  // Gen 1
  { id: 1, name: 'Bulbasaur' },
  { id: 3, name: 'Venusaur' },
  { id: 4, name: 'Charmander' },
  { id: 6, name: 'Charizard' },
  { id: 7, name: 'Squirtle' },
  { id: 9, name: 'Blastoise' },
  { id: 25, name: 'Pikachu' },
  { id: 26, name: 'Raichu' },
  { id: 35, name: 'Clefairy' },
  { id: 37, name: 'Vulpix' },
  { id: 38, name: 'Ninetales' },
  { id: 39, name: 'Jigglypuff' },
  { id: 52, name: 'Meowth' },
  { id: 59, name: 'Arcanine' },
  { id: 65, name: 'Alakazam' },
  { id: 68, name: 'Machamp' },
  { id: 76, name: 'Golem' },
  { id: 78, name: 'Rapidash' },
  { id: 94, name: 'Gengar' },
  { id: 103, name: 'Exeggutor' },
  { id: 112, name: 'Rhydon' },
  { id: 121, name: 'Starmie' },
  { id: 123, name: 'Scyther' },
  { id: 126, name: 'Magmar' },
  { id: 130, name: 'Gyarados' },
  { id: 131, name: 'Lapras' },
  { id: 133, name: 'Eevee' },
  { id: 134, name: 'Vaporeon' },
  { id: 135, name: 'Jolteon' },
  { id: 136, name: 'Flareon' },
  { id: 142, name: 'Aerodactyl' },
  { id: 143, name: 'Snorlax' },
  { id: 144, name: 'Articuno' },
  { id: 145, name: 'Zapdos' },
  { id: 146, name: 'Moltres' },
  { id: 149, name: 'Dragonite' },
  { id: 150, name: 'Mewtwo' },
  { id: 151, name: 'Mew' },
  // Gen 2
  { id: 154, name: 'Meganium' },
  { id: 157, name: 'Typhlosion' },
  { id: 160, name: 'Feraligatr' },
  { id: 169, name: 'Crobat' },
  { id: 181, name: 'Ampharos' },
  { id: 196, name: 'Espeon' },
  { id: 197, name: 'Umbreon' },
  { id: 208, name: 'Steelix' },
  { id: 212, name: 'Scizor' },
  { id: 214, name: 'Heracross' },
  { id: 229, name: 'Houndoom' },
  { id: 243, name: 'Raikou' },
  { id: 244, name: 'Entei' },
  { id: 245, name: 'Suicune' },
  { id: 248, name: 'Tyranitar' },
  { id: 249, name: 'Lugia' },
  { id: 250, name: 'Ho-Oh' },
  // Gen 3
  { id: 254, name: 'Sceptile' },
  { id: 257, name: 'Blaziken' },
  { id: 260, name: 'Swampert' },
  { id: 282, name: 'Gardevoir' },
  { id: 306, name: 'Aggron' },
  { id: 330, name: 'Flygon' },
  { id: 334, name: 'Altaria' },
  { id: 350, name: 'Milotic' },
  { id: 354, name: 'Banette' },
  { id: 359, name: 'Absol' },
  { id: 373, name: 'Salamence' },
  { id: 376, name: 'Metagross' },
  { id: 382, name: 'Kyogre' },
  { id: 383, name: 'Groudon' },
  { id: 384, name: 'Rayquaza' },
  // Gen 4
  { id: 389, name: 'Torterra' },
  { id: 392, name: 'Infernape' },
  { id: 395, name: 'Empoleon' },
  { id: 405, name: 'Luxray' },
  { id: 407, name: 'Roserade' },
  { id: 445, name: 'Garchomp' },
  { id: 448, name: 'Lucario' },
  { id: 461, name: 'Weavile' },
  { id: 468, name: 'Togekiss' },
  { id: 470, name: 'Leafeon' },
  { id: 471, name: 'Glaceon' },
  { id: 475, name: 'Gallade' },
  { id: 483, name: 'Dialga' },
  { id: 484, name: 'Palkia' },
  { id: 487, name: 'Giratina' },
  // Gen 5
  { id: 497, name: 'Serperior' },
  { id: 500, name: 'Emboar' },
  { id: 503, name: 'Samurott' },
  { id: 534, name: 'Conkeldurr' },
  { id: 553, name: 'Krookodile' },
  { id: 571, name: 'Zoroark' },
  { id: 598, name: 'Ferrothorn' },
  { id: 609, name: 'Chandelure' },
  { id: 612, name: 'Haxorus' },
  { id: 635, name: 'Hydreigon' },
  { id: 637, name: 'Volcarona' },
  { id: 643, name: 'Reshiram' },
  { id: 644, name: 'Zekrom' },
  // Gen 6
  { id: 655, name: 'Delphox' },
  { id: 658, name: 'Greninja' },
  { id: 700, name: 'Sylveon' },
  { id: 706, name: 'Goodra' },
  { id: 715, name: 'Noivern' },
  { id: 716, name: 'Xerneas' },
  { id: 717, name: 'Yveltal' },
  // Gen 7
  { id: 724, name: 'Decidueye' },
  { id: 727, name: 'Incineroar' },
  { id: 730, name: 'Primarina' },
  { id: 738, name: 'Vikavolt' },
  { id: 763, name: 'Tsareena' },
  { id: 785, name: 'Tapu Koko' },
  { id: 791, name: 'Solgaleo' },
  { id: 792, name: 'Lunala' },
  // Gen 8
  { id: 812, name: 'Rillaboom' },
  { id: 815, name: 'Cinderace' },
  { id: 818, name: 'Inteleon' },
  { id: 823, name: 'Corviknight' },
  { id: 849, name: 'Toxtricity' },
  { id: 875, name: 'Eiscue' },
  { id: 887, name: 'Dragapult' },
  { id: 888, name: 'Zacian' },
  { id: 889, name: 'Zamazenta' },
  // Gen 9
  { id: 908, name: 'Meowscarada' },
  { id: 911, name: 'Skeledirge' },
  { id: 914, name: 'Quaquaval' },
  { id: 923, name: 'Pawmot' },
  { id: 954, name: 'Rabsca' },
  { id: 978, name: 'Tinkaton' },
  { id: 1007, name: 'Koraidon' },
  { id: 1008, name: 'Miraidon' },
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
      remainingRef.current = [...QUIZ_POKEMON].sort(() => Math.random() - 0.5);
    }
    const answer = remainingRef.current.pop();

    const wrong = [];
    while (wrong.length < 3) {
      const pick = QUIZ_POKEMON[Math.floor(Math.random() * QUIZ_POKEMON.length)];
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
      <div className="quiz-wrap">
        <div className="quiz-hero">
          <h2 className="quiz-hero__title">Qui est ce Pokémon ?</h2>
          <p className="quiz-hero__desc">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

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
            key={current.id}
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${current.id}.png`}
            alt="Silhouette Pokémon"
            className={`quiz-card__img${imgReady ? ' quiz-card__img--ready' : ''}${revealed ? ' quiz-card__img--revealed' : ''}`}
            draggable={false}
            onLoad={() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => setImgReady(true));
              });
            }}
            onError={() => setImgReady(true)}
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
