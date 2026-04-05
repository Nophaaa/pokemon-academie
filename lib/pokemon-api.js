export async function fetchPokemonDetail(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error('Erreur PokeAPI');
  return res.json();
}

export async function fetchPokemonSpecies(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchEvoChain(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export function findEvoDetails(node, name) {
  for (const evo of node.evolves_to) {
    if (evo.species.name === name) return evo.evolution_details;
    const found = findEvoDetails(evo, name);
    if (found) return found;
  }
  return null;
}

const ITEM_FR = {
  'thunder-stone': 'Pierre Foudre',
  'fire-stone': 'Pierre Feu',
  'water-stone': 'Pierre Eau',
  'leaf-stone': 'Pierre Plante',
  'moon-stone': 'Pierre Lune',
  'sun-stone': 'Pierre Soleil',
  'shiny-stone': 'Pierre Éclat',
  'dusk-stone': 'Pierre Nuit',
  'dawn-stone': 'Pierre Aube',
  'ice-stone': 'Pierre Glace',
  'oval-stone': 'Pierre Ovale',
  'kings-rock': 'Roche Royale',
  'metal-coat': 'Peau Métal',
  'dragon-scale': 'Écaille Draco',
  'upgrade': 'Améliorator',
  'dubious-disc': 'CD Douteux',
  'protector': 'Protecteur',
  'electirizer': 'Électriseur',
  'magmarizer': 'Magmariseur',
  'reaper-cloth': 'Tissu Fauche',
  'prism-scale': 'Bel\'Écaille',
  'whipped-dream': 'Chantibonbon',
  'sachet': 'Sachet Senteur',
  'razor-claw': 'Griffe Rasoir',
  'razor-fang': 'Croc Rasoir',
  'deep-sea-tooth': 'Dent Océan',
  'deep-sea-scale': 'Écaille Océan',
  'link-cable': 'Câble de Lien',
  'sweet-apple': 'Pomme Sucrée',
  'tart-apple': 'Pomme Acidulée',
  'cracked-pot': 'Théière Fêlée',
  'chipped-pot': 'Théière Ébréchée',
  'galarica-cuff': 'Bracelet Galanoa',
  'galarica-wreath': 'Couronne Galanoa',
  'black-augurite': 'Obsidienne',
  'peat-block': 'Bloc de Tourbe',
  'auspicious-armor': 'Armure de la Fortune',
  'malicious-armor': 'Armure du Malin',
  'scroll-of-darkness': 'Rouleau des Ténèbres',
  'scroll-of-waters': 'Rouleau des Eaux',
  'syrupy-apple': 'Pomme Sirupeuse',
  'unremarkable-teacup': 'Tasse Quelconque',
  'masterpiece-teacup': 'Tasse Authentique',
};

export function describeEvoMethod(details) {
  if (!details?.length) return null;
  const d = details[0];
  const trigger = d.trigger?.name;
  if (trigger === 'level-up') {
    if (d.min_level && d.time_of_day === 'day') return `Niveau ${d.min_level} (jour)`;
    if (d.min_level && d.time_of_day === 'night') return `Niveau ${d.min_level} (nuit)`;
    if (d.min_level) return `Niveau ${d.min_level}`;
    if (d.min_happiness && d.time_of_day === 'day') return 'Bonheur élevé (jour)';
    if (d.min_happiness && d.time_of_day === 'night') return 'Bonheur élevé (nuit)';
    if (d.min_happiness) return 'Bonheur élevé';
    if (d.known_move_type) return `Montée de niveau (connaître attaque ${d.known_move_type.name})`;
    if (d.known_move) return `Montée de niveau (connaître ${d.known_move.name.replace(/-/g, ' ')})`;
    if (d.min_beauty) return 'Beauté élevée + montée de niveau';
    if (d.min_affection) return 'Affection élevée + montée de niveau';
    if (d.location) return `Montée de niveau (lieu spécial)`;
    if (d.held_item) {
      const itemName = ITEM_FR[d.held_item.name] || d.held_item.name.replace(/-/g, ' ');
      return `Montée de niveau (tenir ${itemName})`;
    }
    if (d.time_of_day === 'day') return 'Montée de niveau (jour)';
    if (d.time_of_day === 'night') return 'Montée de niveau (nuit)';
    return 'Montée de niveau';
  }
  if (trigger === 'use-item') {
    const itemKey = d.item?.name;
    const itemName = ITEM_FR[itemKey] || itemKey?.replace(/-/g, ' ') || '?';
    return `Pierre / Objet : ${itemName}`;
  }
  if (trigger === 'trade') {
    if (d.held_item) {
      const itemName = ITEM_FR[d.held_item.name] || d.held_item.name.replace(/-/g, ' ');
      return `Échange (tenir ${itemName})`;
    }
    return 'Échange (Câble de Lien)';
  }
  if (trigger === 'shed') return 'Apparaît en ayant un emplacement vide + Poké Ball';
  return 'Condition spéciale';
}

export function getFlavorText(entries) {
  const fr = entries?.find((e) => e.language.name === 'fr');
  const en = entries?.find((e) => e.language.name === 'en');
  return (fr || en)?.flavor_text?.replace(/\f|\n/g, ' ') ?? null;
}

export function findChainNode(node, name) {
  if (node.species.name === name) return node;
  for (const evo of node.evolves_to) {
    const found = findChainNode(evo, name);
    if (found) return found;
  }
  return null;
}

export function buildChainPath(root, targetName) {
  function traverse(node, path) {
    const id = parseInt(node.species.url.match(/\/(\d+)\//)?.[1] || '0', 10);
    const stage = { name: node.species.name, id };
    const currentPath = [...path, stage];
    if (node.species.name === targetName) return currentPath;
    for (const evo of node.evolves_to) {
      const method = describeEvoMethod(evo.evolution_details);
      const evoId = parseInt(evo.species.url.match(/\/(\d+)\//)?.[1] || '0', 10);
      const evoStage = { name: evo.species.name, id: evoId, methodFrom: method };
      if (evo.species.name === targetName) return [...currentPath, evoStage];
      const found = traverse(evo, currentPath);
      if (found) {
        // Set the method on the evo stage (index = currentPath.length)
        if (found[currentPath.length] && !found[currentPath.length].methodFrom) {
          found[currentPath.length] = { ...found[currentPath.length], methodFrom: method };
        }
        return found;
      }
    }
    return null;
  }
  return traverse(root, []) || [];
}
