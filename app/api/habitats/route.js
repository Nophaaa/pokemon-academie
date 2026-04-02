import { NextResponse } from 'next/server';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';

const HABITATS = ['cave', 'forest', 'grassland', 'mountain', 'rare', 'rough-terrain', 'sea', 'urban', 'waters-edge'];

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
    const results = await Promise.all(
      HABITATS.map((h) =>
        fetch(`https://pokeapi.co/api/v2/pokemon-habitat/${h}`, {
          next: { revalidate: 86400 },
        }).then((r) => (r.ok ? r.json() : null)),
      ),
    );

    const map = {};
    for (let i = 0; i < HABITATS.length; i++) {
      if (!results[i]) continue;
      for (const species of results[i].pokemon_species) {
        const match = species.url.match(/\/(\d+)\/$/);
        if (match) map[parseInt(match[1])] = HABITATS[i];
      }
    }

    return NextResponse.json(map, { headers: rateLimitHeaders(rl) });
  } catch (err) {
    console.error('Habitats API error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}