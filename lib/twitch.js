// SERVER-SIDE ONLY — never imported by client components

const API_BASE = 'https://api.twitch.tv/helix';

/** Module-level token cache with in-flight dedup */
let cachedToken = null;
let tokenExpiresAt = 0;
let tokenPromise = null;

/**
 * Obtient un App Access Token via Client Credentials Flow.
 * Le token est mis en cache au niveau du module (mémoire serveur).
 * Les requêtes simultanées réutilisent la même Promise (pas de double fetch).
 */
export async function getAppAccessToken() {
  // Validate env vars at call time, not module load — avoids crashing the entire server
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    throw new Error(
      "Variables d'environnement manquantes : TWITCH_CLIENT_ID et TWITCH_CLIENT_SECRET sont requises. Voir .env.example",
    );
  }

  if (cachedToken && Date.now() < tokenExpiresAt - 300_000) {
    return cachedToken;
  }

  // Dedup: si un fetch est déjà en cours, réutiliser la même Promise
  if (tokenPromise) return tokenPromise;

  tokenPromise = (async () => {
    const resp = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    });

    if (!resp.ok) {
      throw new Error(`Impossible d'obtenir un token Twitch (${resp.status})`);
    }

    const data = await resp.json();
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + data.expires_in * 1000;
    return cachedToken;
  })().finally(() => {
    tokenPromise = null;
  });

  return tokenPromise;
}

/**
 * Effectue un appel authentifié à l'API Helix.
 * @param {string} endpoint — chemin relatif, ex: "/streams?user_login=..."
 * @returns {Promise<object>} — corps JSON de la réponse
 */
export async function twitchFetch(endpoint) {
  const token = await getAppAccessToken();

  const resp = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!resp.ok) {
    throw new Error(`Twitch API ${resp.status} sur ${endpoint}`);
  }

  return resp.json();
}
