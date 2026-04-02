import { NextResponse } from 'next/server';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';

const ALLOWED_PARAMS = [
  'action',
  'page',
  'prop',
  'list',
  'cmtitle',
  'cmlimit',
  'search',
  'limit',
  'srsearch',
  'srnamespace',
  'aplimit',
  'apfrom',
  'ailimit',
  'aiprop',
  'aidir',
  'aicontinue',
  'titles',
  'iiprop',
];

export async function GET(request) {
  // Rate limiting: 30 requests/minute per IP (wiki is less critical)
  const rl = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans quelques instants.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  const { searchParams } = new URL(request.url);

  const wikiUrl = new URL('https://wiki.cobblemon.com/api.php');
  for (const key of ALLOWED_PARAMS) {
    if (searchParams.has(key)) {
      wikiUrl.searchParams.set(key, searchParams.get(key));
    }
  }
  wikiUrl.searchParams.set('format', 'json');
  wikiUrl.searchParams.set('origin', '*');

  try {
    const res = await fetch(wikiUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 PA2-Hub/1.0',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Wiki: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: rateLimitHeaders(rl) });
  } catch (err) {
    console.error('Wiki API error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}