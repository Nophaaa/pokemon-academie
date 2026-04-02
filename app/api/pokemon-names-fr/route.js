import { NextResponse } from 'next/server';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';

const CONCURRENCY = 100;
const MAX_ID = 1025;

/**
 * Charge les noms FR par lots parallèles (100 simultanés).
 * Beaucoup plus rapide que l'ancien mode séquentiel (1025 appels un par un).
 * Le cache Next.js (revalidate 7j) évite de re-fetcher à chaque requête.
 */
async function fetchBatch(start, end) {
  return Promise.all(
    Array.from({ length: end - start + 1 }, (_, i) => start + i).map((id) =>
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`, {
        next: { revalidate: 604800 },
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ),
  );
}

export async function GET(request) {
  // Rate limiting: 10 requests/minute per IP (heavy route — 1025 outbound fetches)
  const rl = rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans quelques instants.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  try {
    const map = {};

    // Process in parallel batches of CONCURRENCY to avoid overwhelming PokeAPI
    for (let start = 1; start <= MAX_ID; start += CONCURRENCY) {
      const end = Math.min(start + CONCURRENCY - 1, MAX_ID);
      const batch = await fetchBatch(start, end);

      for (const data of batch) {
        if (!data) continue;
        const fr = data.names?.find((n) => n.language.name === 'fr')?.name;
        if (fr) map[data.id] = fr;
      }
    }

    return NextResponse.json(map, { headers: rateLimitHeaders(rl) });
  } catch (err) {
    console.error('pokemon-names-fr error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}