const FEATURES = [
  {
    icon: '/icons/dire_hit.png',
    title: 'Combat Pokémon',
    desc: 'Affronte des Pokémon sauvages dans le monde Minecraft. Système de combat au tour par tour fidèle aux jeux.',
  },
  {
    icon: '/icons/grass_tera_shard.png',
    title: 'Apparitions naturelles',
    desc: 'Les Pokémon apparaissent dans les biomes correspondant à leur type. Trouvez des Pokémon rares dans des zones cachées.',
  },
  {
    icon: '/icons/azure_rod.png',
    title: 'Pêche',
    desc: "Pêchez des Pokémon aquatiques dans les rivières, lacs et océans. Chaque plan d'eau a ses propres espèces.",
  },
  {
    icon: '/icons/link_cable.png',
    title: 'Évolutions',
    desc: 'Faites évoluer vos Pokémon par niveaux, échanges via le Câble de lien, ou conditions spéciales.',
  },
  {
    icon: '/icons/oran_berry.png',
    title: 'Baies & Soins',
    desc: 'Cultivez des Baies pour soigner vos Pokémon. Cuisinez des Bonbons dans la Marmite pour booster leurs stats.',
  },
  {
    icon: '/icons/protein.png',
    title: 'Dressage',
    desc: 'Développez vos stratégies, gérez les IV/EV et devenez le meilleur dresseur du serveur.',
  },
];

const GENERATIONS = [
  { gen: 'Gén. I', count: '151', color: '#f5c800' },
  { gen: 'Gén. II', count: '100', color: '#e4001b' },
  { gen: 'Gén. III', count: '135', color: '#3b82f6' },
  { gen: 'Gén. IV', count: '107', color: '#9147ff' },
  { gen: 'Gén. V', count: '156', color: '#f5c800' },
  { gen: 'Gén. VI', count: '72', color: '#e4001b' },
  { gen: 'Gén. VII', count: '88', color: '#3b82f6' },
  { gen: 'Gén. VIII', count: '96', color: '#9147ff' },
  { gen: 'Gén. IX', count: '120', color: '#f5c800' },
];

export default function Accueil() {
  return (
    <div className="accueil-wrap">
      <div className="accueil-hero">
        <div className="accueil-hero__pokeball" aria-hidden="true" />
        <div className="accueil-hero__badge">Mod Pokémon pour Minecraft</div>
        <h1 className="accueil-hero__title">
          <span className="mc-text">Cobblemon</span> <span className="mc-text mc-text--accent">Académie</span>{' '}
          <span className="mc-text mc-text--gold">2.0</span>
        </h1>
        <p className="accueil-hero__desc">
          Le mod Pokémon le plus fidèle pour Minecraft. Capture, entraîne et combats avec des centaines de Pokémon
          directement dans ton monde Minecraft.
        </p>
        <p className="accueil-hero__disclaimer">
          Non affilié à Pokérayou — même modpack, événement indépendant par{' '}
          <a href="https://x.com/AREtoiles" target="_blank" rel="noopener noreferrer">
            Étoiles
          </a>
          .
        </p>
        <div className="accueil-gens">
          {GENERATIONS.map((g) => (
            <div key={g.gen} className="accueil-gen" style={{ '--gen-color': g.color }}>
              <span className="accueil-gen__count">{g.count}</span>
              <span className="accueil-gen__label">{g.gen}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="accueil-section">
        <h2 className="accueil-section__title">Fonctionnalités</h2>
        <div className="accueil-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="accueil-feature">
              <img src={f.icon} alt="" className="accueil-feature__icon" draggable={false} />
              <div>
                <div className="accueil-feature__title">{f.title}</div>
                <div className="accueil-feature__desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
