import { NextResponse } from 'next/server';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';

const TYPES_LIST = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

export async function GET(request) {
  // Rate limiting: 20 requests/minute per IP
  const rl = rateLimit(request, { limit: 20, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans quelques instants.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  try {
    const [listRes, ...typeRes] = await Promise.all([
      fetch('https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0', { next: { revalidate: 86400 } }),
      ...TYPES_LIST.map((t) => fetch(`https://pokeapi.co/api/v2/type/${t}`, { next: { revalidate: 86400 } })),
    ]);

    if (!listRes.ok) throw new Error('PokeAPI indisponible');

    const listData = await listRes.json();
    const typeData = await Promise.all(typeRes.map((r) => (r.ok ? r.json() : null)));

    // Build type map: pokemonId → [Type1, Type2]
    const typeMap = {};
    for (let i = 0; i < TYPES_LIST.length; i++) {
      if (!typeData[i]) continue;
      const typeName = TYPES_LIST[i].charAt(0).toUpperCase() + TYPES_LIST[i].slice(1);
      for (const entry of typeData[i].pokemon) {
        const match = entry.pokemon.url.match(/\/(\d+)\/$/);
        if (!match) continue;
        const id = parseInt(match[1]);
        if (id > 1025) continue; // skip formes alternatives
        if (!typeMap[id]) typeMap[id] = [];
        typeMap[id].push(typeName);
      }
    }

    const pokemon = listData.results.map((p, i) => {
      const id = i + 1;
      return {
        id,
        name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        fallback: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        types: typeMap[id] || [],
      };
    });

    return NextResponse.json(pokemon, { headers: rateLimitHeaders(rl) });
  } catch (err) {
    console.error('Pokedex API error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}