export async function apiFetch(endpoint) {
  const res = await fetch(`/api/twitch?endpoint=${encodeURIComponent(endpoint)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erreur API (${res.status})`);
  }
  return res.json();
}
