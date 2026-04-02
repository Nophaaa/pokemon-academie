const STAT_LABELS = {
  hp: 'PV',
  attack: 'Att',
  defense: 'Déf',
  'special-attack': 'Att Sp',
  'special-defense': 'Déf Sp',
  speed: 'Vitesse',
};
const STAT_MAX = 255;

export default function StatBar({ name, value, index = 0 }) {
  const pct = Math.min(100, Math.round((value / STAT_MAX) * 100));
  const color = value >= 100 ? '#63bc5a' : value >= 70 ? '#f3d23b' : '#f97176';
  return (
    <div className="stat-row">
      <span className="stat-row__name">{STAT_LABELS[name] || name}</span>
      <span className="stat-row__val" style={{ color }}>
        {value}
      </span>
      <div className="stat-row__bar">
        <div
          className="stat-row__fill"
          style={{ width: `${pct}%`, background: color, animationDelay: `${index * 0.07}s` }}
        ></div>
      </div>
    </div>
  );
}
