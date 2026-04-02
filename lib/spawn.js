import {
  COBBL_BIOME_FR,
  COBBL_BUCKET_FR,
  COBBL_CTX_FR,
  COBBL_DIM_FR,
  COBBL_TIME_FR,
  getBiomeEnLabel,
} from '@/lib/data/cobblemon';

let _spawnCache = null;

export async function loadSpawnData() {
  if (_spawnCache) return _spawnCache;
  try {
    const r = await fetch('/spawn-data.json');
    if (!r.ok) return {};
    _spawnCache = await r.json();
    return _spawnCache;
  } catch (e) {
    console.warn('Pokemon API error:', e);
    return {};
  }
}

export async function fetchCobblemonSpawn(name) {
  const data = await loadSpawnData();
  return data[name.toLowerCase()] || null;
}

export function parseSpawnData(json) {
  const entries = json?.entries?.length
    ? json.entries
    : json?.spawns?.length
      ? json.spawns
      : Array.isArray(json) && json.length
        ? json
        : json?.pokemon || json?.condition || json?.bucket
          ? [json]
          : null;
  if (!entries?.length) return null;

  const biomeSet = new Set();
  const dimSet = new Set();
  const timeSet = new Set();
  let raining = false;

  const primary = entries[0];
  const bucket = COBBL_BUCKET_FR[primary.bucket] || { label: primary.bucket || '?', color: '#aaa' };
  const context = COBBL_CTX_FR[primary.context] || primary.context || null;
  const level = primary.level || null;

  for (const entry of entries.slice(0, 6)) {
    const cond = entry.condition || {};
    (cond.biomes || []).forEach((b) => biomeSet.add(b));
    (cond.dimensions || []).forEach((d) => dimSet.add(d));
    if (cond.timeRange && cond.timeRange !== 'any') timeSet.add(cond.timeRange);
    if (cond.isRaining) raining = true;
  }

  const biomes = [...biomeSet]
    .map((b) => {
      const fr = COBBL_BIOME_FR[b];
      const en = getBiomeEnLabel(b);
      return fr ? `${fr} (${en})` : en;
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 8);

  const dims = dimSet.size ? [...dimSet].map((d) => COBBL_DIM_FR[d] || d) : ['Overworld'];
  const times = timeSet.size ? [...timeSet].map((t) => COBBL_TIME_FR[t] || t) : ['Toute la journée'];

  return { biomes, dims, times, raining, level, context, bucket };
}
