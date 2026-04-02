export const COMMANDS = [
  {
    category: 'Pokémon',
    cmds: [
      { cmd: '/pokegive <joueur> <pokemon> [niveau]', desc: 'Donne un Pokémon à un joueur' },
      { cmd: '/pokeheal [joueur]', desc: 'Soigne tous les Pokémon du joueur' },
      { cmd: '/pokespawn <pokemon>', desc: 'Fait apparaître un Pokémon devant toi' },
      { cmd: '/pokesee <joueur>', desc: "Regarde le PC d'un joueur (admin)" },
      { cmd: '/pokeedit', desc: "Édite les stats d'un Pokémon en main" },
      { cmd: '/pokeinfo', desc: 'Affiche les infos du Pokémon en main' },
    ],
  },
  {
    category: 'Dresseur',
    cmds: [
      { cmd: '/starter', desc: 'Choisir ton Pokémon de départ' },
      { cmd: '/pc', desc: 'Ouvre ton PC à distance' },
      { cmd: '/pokeparty', desc: 'Affiche ta team actuelle' },
    ],
  },
  {
    category: 'Administration',
    cmds: [
      { cmd: '/cobblemon reload', desc: 'Recharge la config du mod' },
      { cmd: '/spawnpokemon', desc: 'Force un spawn Pokémon à ta position' },
      { cmd: '/checkspawns', desc: 'Vérifie quels Pokémon peuvent spawner ici' },
      { cmd: '/pokeshout <joueur>', desc: "Annonce le Pokémon capturé d'un joueur" },
    ],
  },
];
