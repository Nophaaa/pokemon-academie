import { initials } from '@/lib/utils';

export default function FallbackAvatar({ login, className = 'avatar-fallback' }) {
  return (
    <div className={className} aria-label={`Avatar de ${login}`}>
      {initials(login)}
    </div>
  );
}
