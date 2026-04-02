import { TYPE_COLORS, TYPE_FR } from '@/lib/data/types';

export default function TypeBadge({ type, small }) {
  return (
    <span
      className={`type-badge${small ? ' type-badge--sm' : ''}`}
      style={{ background: TYPE_COLORS[type] || '#888' }}
      title={TYPE_FR[type] || type}
    >
      {TYPE_FR[type] || type}
    </span>
  );
}
