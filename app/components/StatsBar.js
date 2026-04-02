import { STREAMERS } from '@/lib/constants';
import { formatPlaytime } from '@/lib/utils';

export default function StatsBar({ streams, clips, loading }) {
  const liveCount = Object.keys(streams).length;
  const playtime = formatPlaytime(streams);
  const totalClips = clips?.length ?? 0;

  const val = (v) => (loading ? '—' : v);

  return (
    <section className="stats-bar">
      <div className="stats-bar__inner">
        <div className="stats-card stats-card--gold">
          <div className="stats-card__pokeball-top"></div>
          <div className="stats-card__pokeball-divider">
            <span className="stats-card__pokeball-btn"></span>
          </div>
          <div className="stats-card__pokeball-bottom">
            <div className="stats-card__label">STREAMERS EN LIVE</div>
            <div className="stats-card__value">{val(liveCount)}</div>
          </div>
        </div>
        <div className="stats-card stats-card--red">
          <div className="stats-card__pokeball-top"></div>
          <div className="stats-card__pokeball-divider">
            <span className="stats-card__pokeball-btn"></span>
          </div>
          <div className="stats-card__pokeball-bottom">
            <div className="stats-card__label">PARTICIPANTS</div>
            <div className="stats-card__value">{STREAMERS.length}</div>
          </div>
        </div>
        <div className="stats-card stats-card--blue">
          <div className="stats-card__pokeball-top"></div>
          <div className="stats-card__pokeball-divider">
            <span className="stats-card__pokeball-btn"></span>
          </div>
          <div className="stats-card__pokeball-bottom">
            <div className="stats-card__label">TEMPS DE JEU</div>
            <div className="stats-card__value">{val(playtime)}</div>
            <div className="stats-card__sub">heures de stream</div>
          </div>
        </div>
        <div className="stats-card stats-card--purple">
          <div className="stats-card__pokeball-top"></div>
          <div className="stats-card__pokeball-divider">
            <span className="stats-card__pokeball-btn"></span>
          </div>
          <div className="stats-card__pokeball-bottom">
            <div className="stats-card__label">CLIPS DISPONIBLES</div>
            <div className="stats-card__value">{val(totalClips)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
