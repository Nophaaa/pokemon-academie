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

export function describeEvoMethod(details) {
  if (!details?.length) return null;
  const d = details[0];
  const trigger = d.trigger?.name;
  if (trigger === 'level-up') {
    if (d.min_level) return `Niveau ${d.min_level}`;
    if (d.min_happiness) return 'Bonheur élevé';
    if (d.time_of_day === 'day') return 'Bonheur (jour)';
    if (d.time_of_day === 'night') return 'Bonheur (nuit)';
    return 'Montée de niveau';
  }
  if (trigger === 'use-item') return `Pierre : ${d.item?.name?.replace(/-/g, ' ') || '?'}`;
  if (trigger === 'trade') {
    if (d.held_item) return `Échange (tenir ${d.held_item.name.replace(/-/g, ' ')})`;
    return 'Échange (Câble de lien)';
  }
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
    if (node.species.name === targetName) return [...path, stage];
    for (const evo of node.evolves_to) {
      const method = describeEvoMethod(evo.evolution_details);
      const found = traverse(evo, [...path, stage]);
      if (found) {
        found[found.length - 1] = { ...found[found.length - 1], methodFrom: method };
        return found;
      }
    }
    return null;
  }
  return traverse(root, []) || [];
}
