export const HABITATS_FR = {
  cave: 'Grottes & mines',
  forest: 'Forêt (Jungle, Taïga…)',
  grassland: 'Plaines & savane',
  mountain: 'Montagnes & pics',
  rare: 'Spawn rare',
  'rough-terrain': 'Badlands & mesas',
  sea: 'Océan & rivières',
  urban: 'Plaines & villages',
  'waters-edge': 'Marais & berges',
};

export const HABITAT_META = {
  cave: { label: 'Grottes', color: '#5a5465', icon: '🪨' },
  forest: { label: 'Forêt', color: '#63bc5a', icon: '🌲' },
  grassland: { label: 'Plaines', color: '#9ccc65', icon: '🌿' },
  mountain: { label: 'Montagnes', color: '#9199a1', icon: '⛰️' },
  rare: { label: 'Spawn rare', color: '#f3d23b', icon: '✨' },
  'rough-terrain': { label: 'Terrain accidenté', color: '#d97845', icon: '🏜️' },
  sea: { label: 'Mer / Océan', color: '#4fc1ff', icon: '🌊' },
  urban: { label: 'Zones urbaines', color: '#9199a1', icon: '🏘️' },
  'waters-edge': { label: 'Berges / Marais', color: '#74cec0', icon: '🏞️' },
};

export const EGG_GROUPS_FR = {
  monster: 'Monstre',
  water1: 'Eau 1',
  water2: 'Eau 2',
  water3: 'Eau 3',
  bug: 'Insecte',
  flying: 'Vol',
  ground: 'Terrestre',
  fairy: 'Fée',
  plant: 'Plante',
  humanshape: 'Humanoïde',
  mineral: 'Minéral',
  indeterminate: 'Informe',
  ditto: 'Métamorph',
  dragon: 'Dragon',
  'no-eggs': 'Sans œuf',
};

export function getRarity(rate) {
  if (rate <= 3) return { label: 'Légendaire / Rare', color: '#f3d23b' };
  if (rate <= 25) return { label: 'Très rare', color: '#ce416b' };
  if (rate <= 75) return { label: 'Rare', color: '#ff9c54' };
  if (rate <= 150) return { label: 'Peu commun', color: '#4fc1ff' };
  return { label: 'Commun', color: '#63bc5a' };
}
