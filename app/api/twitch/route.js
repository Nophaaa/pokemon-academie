import { NextResponse } from 'next/server';
import { twitchFetch } from '@/lib/twitch';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';

/** Endpoints Twitch Helix autorisés (whitelist) */
const ALLOWED_ENDPOINTS = new Set(['/users', '/streams', '/clips', '/videos']);

/**
 * Normalise et valide le chemin de l'endpoint.
 * Résout les segments ".." pour bloquer les path traversal.
 * Retourne null si l'endpoint est invalide ou non autorisé.
 */
function validateEndpoint(raw) {
  // Séparer le path des query params
  const [pathPart, ...queryParts] = raw.split('?');
  const query = queryParts.length ? `?${queryParts.join('?')}` : '';

  // Normaliser : retirer les slashes en trop, résoudre ".."
  const segments = pathPart.split('/').filter(Boolean);
  const resolved = [];
  for (const seg of segments) {
    if (seg === '..') resolved.pop();
    else if (seg !== '.') resolved.push(seg);
  }

  if (resolved.length === 0) return null;

  const basePath = `/${resolved[0]}`;
  if (!ALLOWED_ENDPOINTS.has(basePath)) return null;

  return `/${resolved.join('/')}${query}`;
}

export async function GET(request) {
  // Rate limiting: 60 requests/minute per IP
  const rl = rateLimit(request, { limit: 60, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans quelques instants.' },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: "Paramètre 'endpoint' manquant." }, { status: 400 });
  }

  const safePath = validateEndpoint(endpoint);
  if (!safePath) {
    return NextResponse.json({ error: 'Endpoint non autorisé.' }, { status: 403 });
  }

  try {
    const data = await twitchFetch(safePath);
    return NextResponse.json(data, { headers: rateLimitHeaders(rl) });
  } catch (err) {
    console.error('Erreur API Twitch :', err?.message || err);
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 502, headers: rateLimitHeaders(rl) },
    );
  }
}