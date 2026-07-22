'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';

interface Particle {
  tx: number;
  ty: number;
  size: number;
  gold: boolean;
  delay: number;
  rot: number;
}

const CONFETTI = ['#de009b', '#743df5', '#178d88'];

// Mostly gold coins flying up, with a few colour confetti mixed in — the reward
// leaving the card. Seeded once on mount so the burst is stable across renders.
const build = (): Particle[] =>
  Array.from({ length: 22 }, (_, i) => ({
    tx: (Math.random() - 0.5) * 240,
    ty: -(Math.random() * 180 + 70),
    size: 6 + Math.round(Math.random() * 6),
    gold: i % 3 !== 0,
    delay: Math.random() * 0.18,
    rot: Math.random() * 360,
  }));

/**
 * One-shot coin/confetti burst played over the level card when a level is
 * claimed. Reuses the shared `task-confetti-particle` keyframes (see
 * styles/components/tasks.css). Mount it with a changing `key` to replay; it
 * self-fades and stays inert (pointer-events-none) afterward.
 */
export function TestQuestClaimBurst() {
  const [particles] = useState(build);

  return (
    <div
      aria-hidden
      className="flex-center pointer-events-none absolute inset-0 z-20 overflow-hidden"
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="task-confetti-particle absolute"
          style={
            {
              width: p.size,
              height: p.size,
              borderRadius: p.gold ? '9999px' : '2px',
              background: p.gold
                ? 'linear-gradient(180deg, #ffe6a1, #f8bd3e 55%, #b9852a)'
                : CONFETTI[i % CONFETTI.length],
              boxShadow: p.gold ? '0 0 6px rgba(248, 189, 62, 0.6)' : undefined,
              transform: `rotate(${p.rot}deg)`,
              animationDelay: `${p.delay}s`,
              ['--tx']: `${p.tx}px`,
              ['--ty']: `${p.ty}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
