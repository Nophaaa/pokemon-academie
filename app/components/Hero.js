'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const PB_ROWS = [
  '____kkkkkkk____',
  '___krrrrrrRk___',
  '__kRRrrrrrrRk__',
  '_krRrrrrrrrrRk_',
  '_krrrrrrrrrrRk_',
  'krrrrrrrrrrrrRk',
  'krrrrrrrrrrrrrk',
  'kddddkBkdddddk',
  'kwwwwwwwwwwwwwk',
  'kwwwwwwwwwwwwwk',
  '_kwWwwwwwwwWwk_',
  '_kwwwwwwwwwwwk_',
  '__kwwwwwwwwwk__',
  '___kWwwwwWwk___',
  '____kkkkkkk____',
];

const PB_SIZE = 15;
const PB_COLORS = {
  _: 'transparent',
  r: '#e4001b',
  R: '#ff4d5e',
  d: '#1a1a1a',
  B: '#ffffff',
  w: '#eaeaea',
  W: '#ffffff',
  k: '#222',
};

function PixelPokeball() {
  return (
    <div className="hero-pokeball-mc" aria-label="Pokéball Minecraft">
      <div className="mc-ball">
        {PB_ROWS.map((row, y) => {
          const cells = row.padEnd(PB_SIZE, '_').slice(0, PB_SIZE);
          return cells.split('').map((c, x) => (
            <i
              key={`${y}-${x}`}
              style={{
                background: PB_COLORS[c] || 'transparent',
                boxShadow: c === 'B' ? '0 0 8px #fff, 0 0 16px rgba(145,70,255,0.6)' : 'none',
              }}
            />
          ));
        })}
      </div>
    </div>
  );
}

const BALL_COUNT = 50;
const BALL_REPULSE = 120;
const BALL_FORCE = 3.8;
const BALL_FRICTION = 0.96;
const LINE_MAX_DIST = 280;
const LINE_CUT_DIST = 45;
const BALL_HUES = [270, 0, 210, 340, 45, 160];

let audioCtx = null;

function initBalls(w, h) {
  return Array.from({ length: BALL_COUNT }, (_, i) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: 14 + Math.random() * 16,
    caught: false,
    catchAnim: 0,
    hue: BALL_HUES[i % BALL_HUES.length],
    pulse: Math.random() * Math.PI * 2,
  }));
}

export default function Hero() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const ballsRef = useRef([]);
  const linesRef = useRef([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);
  const isVisibleRef = useRef(true);
  const [caught, setCaught] = useState(0);
  const [total] = useState(BALL_COUNT);

  useEffect(() => {
    const el = heroRef.current;
    const cvs = canvasRef.current;
    if (!el || !cvs) return;
    const ctx = cvs.getContext('2d');

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    observer.observe(el);

    const resize = () => {
      const r = el.getBoundingClientRect();
      cvs.width = r.width * devicePixelRatio;
      cvs.height = r.height * devicePixelRatio;
      cvs.style.width = r.width + 'px';
      cvs.style.height = r.height + 'px';
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();

    const r0 = el.getBoundingClientRect();
    ballsRef.current = initBalls(r0.width, r0.height);

    const rebuildLines = () => {
      const b = ballsRef.current;
      const lines = [];
      for (let i = 0; i < b.length; i++) {
        for (let j = i + 1; j < b.length; j++) {
          const dx = b[i].x - b[j].x;
          const dy = b[i].y - b[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < LINE_MAX_DIST) {
            lines.push({ a: i, b: j, cut: false, cutAnim: 0 });
          }
        }
      }
      linesRef.current = lines;
    };
    rebuildLines();
    const rebuildInterval = setInterval(rebuildLines, 1500);

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', resize);

    let time = 0;

    const drawBall = (ball) => {
      const { x, y, size, hue, caught: c, catchAnim, pulse } = ball;
      if (c && catchAnim >= 1) return;

      const breathe = 1 + Math.sin(time * 0.8 + pulse) * 0.04;
      const alpha = c ? Math.max(0, 1 - catchAnim) : 0.75;
      const s = c ? size * (1 + catchAnim * 2) * breathe : size * breathe;
      const half = s / 2;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      if (c) ctx.rotate(catchAnim * Math.PI * 2);

      const glowIntensity = 0.4 + Math.sin(time * 1.2 + pulse) * 0.2;
      ctx.shadowColor = `hsla(${hue}, 85%, 60%, ${glowIntensity})`;
      ctx.shadowBlur = 16 + Math.sin(time + pulse) * 4;

      ctx.beginPath();
      ctx.arc(0, 0, half, Math.PI, 0);
      ctx.fillStyle = `hsl(${hue}, 78%, 52%)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, half, 0, Math.PI);
      ctx.fillStyle = '#f0f0f0';
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.moveTo(-half, 0);
      ctx.lineTo(half, 0);
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = Math.max(1.5, s * 0.07);
      ctx.stroke();

      const btnR = half * 0.22;
      ctx.beginPath();
      ctx.arc(0, 0, btnR, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = `hsla(${hue}, 90%, 70%, 0.8)`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = Math.max(1, s * 0.05);
      ctx.stroke();

      ctx.restore();
    };

    const tick = () => {
      if (!isVisibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      time += 0.016;
      const b = ballsRef.current;
      const m = mouseRef.current;
      const r = el.getBoundingClientRect();
      const W = r.width;
      const H = r.height;

      for (const ball of b) {
        if (ball.caught) {
          ball.catchAnim = Math.min(1, ball.catchAnim + 0.025);
          continue;
        }
        const dx = ball.x - m.x;
        const dy = ball.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BALL_REPULSE && dist > 0) {
          const f = BALL_FORCE * (1 - dist / BALL_REPULSE);
          ball.vx += (dx / dist) * f;
          ball.vy += (dy / dist) * f;
        }
        ball.vx += Math.sin(time * 0.5 + ball.pulse) * 0.015;
        ball.vy += Math.cos(time * 0.4 + ball.pulse * 1.3) * 0.015;
        ball.vx *= BALL_FRICTION;
        ball.vy *= BALL_FRICTION;
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x < ball.size) {
          ball.x = ball.size;
          ball.vx *= -0.4;
        }
        if (ball.x > W - ball.size) {
          ball.x = W - ball.size;
          ball.vx *= -0.4;
        }
        if (ball.y < ball.size) {
          ball.y = ball.size;
          ball.vy *= -0.4;
        }
        if (ball.y > H - ball.size) {
          ball.y = H - ball.size;
          ball.vy *= -0.4;
        }
      }

      for (const line of linesRef.current) {
        if (line.cut) {
          line.cutAnim = Math.min(1, line.cutAnim + 0.04);
          continue;
        }
        const a = b[line.a];
        const bb = b[line.b];
        if (a.caught || bb.caught) {
          line.cut = true;
          line.cutAnim = 0;
          continue;
        }
        const lx = bb.x - a.x;
        const ly = bb.y - a.y;
        const len2 = lx * lx + ly * ly;
        if (len2 === 0) continue;
        let t = ((m.x - a.x) * lx + (m.y - a.y) * ly) / len2;
        t = Math.max(0, Math.min(1, t));
        const px = a.x + t * lx;
        const py = a.y + t * ly;
        const d = Math.sqrt((m.x - px) ** 2 + (m.y - py) ** 2);
        if (d < LINE_CUT_DIST) {
          line.cut = true;
          line.cutAnim = 0;
        }
      }

      ctx.clearRect(0, 0, W, H);

      for (const line of linesRef.current) {
        const a = b[line.a];
        const bb = b[line.b];
        if (a.caught && a.catchAnim >= 1) continue;
        if (bb.caught && bb.catchAnim >= 1) continue;
        const dx = a.x - bb.x;
        const dy = a.y - bb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > LINE_MAX_DIST * 1.3) continue;
        const alpha = line.cut ? Math.max(0, 0.6 * (1 - line.cutAnim)) : 0.6 * Math.max(0, 1 - dist / LINE_MAX_DIST);
        if (alpha <= 0) continue;

        const grad = ctx.createLinearGradient(a.x, a.y, bb.x, bb.y);
        grad.addColorStop(0, `hsla(${a.hue}, 80%, 65%, ${alpha})`);
        grad.addColorStop(1, `hsla(${bb.hue}, 80%, 65%, ${alpha})`);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(bb.x, bb.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = line.cut ? 1.5 * (1 - line.cutAnim) : 1.5;
        ctx.stroke();
      }

      for (const ball of b) drawBall(ball);

      if (m.x > 0 && m.y > 0) {
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 80);
        g.addColorStop(0, 'rgba(145, 70, 255, 0.18)');
        g.addColorStop(0.5, 'rgba(228, 0, 27, 0.06)');
        g.addColorStop(1, 'rgba(145, 70, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(rebuildInterval);
      observer.disconnect();
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const playCatchSound = useCallback(() => {
    try {
      if (!audioCtx) {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioCtor();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }, []);

  const handleClick = useCallback(
    (e) => {
      const el = heroRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      for (const ball of ballsRef.current) {
        if (ball.caught) continue;
        const dx = ball.x - mx;
        const dy = ball.y - my;
        if (Math.sqrt(dx * dx + dy * dy) < ball.size + 14) {
          ball.caught = true;
          ball.catchAnim = 0;
          playCatchSound();
          for (const other of ballsRef.current) {
            if (other.caught || other === ball) continue;
            const odx = other.x - ball.x;
            const ody = other.y - ball.y;
            const od = Math.sqrt(odx * odx + ody * ody);
            if (od < 120 && od > 0) {
              other.vx += (odx / od) * 3;
              other.vy += (ody / od) * 3;
            }
          }
          setCaught((c) => c + 1);
          break;
        }
      }
    },
    [playCatchSound],
  );

  return (
    <section className="hero" id="accueil" ref={heroRef} onClick={handleClick} style={{ cursor: 'crosshair' }}>
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
      {caught > 0 && (
        <div className="hero-catch-counter">
          {caught}/{total} Pokéball{caught > 1 ? 's' : ''} capturée{caught > 1 ? 's' : ''} !
          {caught >= total && ' 🎉 Bravo !'}
        </div>
      )}
      <div className="hero__inner">
        <PixelPokeball />
        <h1 className="hero__title">
          <span className="mc-text">Pokémon</span> <span className="mc-text mc-text--accent">Académie</span>{' '}
          <span className="mc-text mc-text--gold">2</span>
        </h1>
        <p className="hero__subtitle">
          Événement organisé par <strong>Nopha</strong> &amp; <strong>Jomargie</strong>
        </p>
        <p className="hero__desc">
          Retrouvez tous les streamers du projet, découvrez qui est en live et revivez les meilleurs moments en clips.
        </p>
        <p className="hero__modpack">
          Modpack :{' '}
          <a
            href="https://www.curseforge.com/minecraft/modpacks/cobblemon-academy-2-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cobblemon Academy 2.0
          </a>{' '}
          sur CurseForge
        </p>
        <p className="hero__disclaimer">
          Non affilié à Pokérayou — même modpack, événement indépendant par{' '}
          <a href="https://x.com/AREtoiles" target="_blank" rel="noopener noreferrer">
            Étoiles
          </a>
          .
        </p>
        <p className="hero__hint">Coupe les fils et attrape les Pokéballs !</p>
      </div>
    </section>
  );
}
