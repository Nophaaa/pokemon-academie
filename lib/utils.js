export function formatViews(n) {
  return Number(n).toLocaleString('fr-FR');
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatPlaytime(streams) {
  const totalMs = Object.values(streams).reduce((sum, st) => {
    return sum + Math.max(0, Date.now() - new Date(st.started_at).getTime());
  }, 0);
  const totalHours = Math.floor(totalMs / 3_600_000);
  return totalHours;
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('fr-FR');
}

export function initials(login) {
  return login.slice(0, 2).toUpperCase();
}

export function isRecentClip(isoString) {
  return Date.now() - new Date(isoString).getTime() < 24 * 60 * 60 * 1000;
}
