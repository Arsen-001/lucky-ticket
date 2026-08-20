'use client';

import { twMerge } from 'tailwind-merge';
import { DuelPlayerAvatar } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPlayerAvatar';

export interface DuelSideProps {
  name: string;
  avatarUrl?: string;
  /** Побед в матче у этой стороны и сколько нужно всего. */
  wins: number;
  winsNeeded: number;
  /** Бейдж состояния: «готов», «ждём», «сходил». Пусто — бейджа нет. */
  badge?: { text: string; tone: 'ready' | 'moved' | 'idle' } | null;
  ringed?: boolean;
  className?: string;
}

/**
 * Подпись стороны: аватар, имя, счёт точками и бейдж состояния.
 *
 * Счёт точками, а не цифрами: в матче до двух побед две зажжённые точки
 * читаются мгновенно, а «2:1» требует вспомнить, чей счёт первый.
 */
export function DuelSide({
  name,
  avatarUrl,
  wins,
  winsNeeded,
  badge,
  ringed,
  className,
}: DuelSideProps) {
  const tone = {
    ready: 'border-success-text/50 bg-success/12 text-success-text',
    moved: 'border-gold/45 bg-gold/10 text-gold',
    idle: 'text-disabled border-white/12',
  };

  return (
    <div className={twMerge('flex items-center justify-center gap-2', className)}>
      <DuelPlayerAvatar name={name} avatarUrl={avatarUrl} size={30} ready={ringed} />
      <span className="text-gray-secondary max-w-[9rem] truncate text-[13px] font-semibold">
        {name}
      </span>

      <span className="flex gap-1.5">
        {Array.from({ length: winsNeeded }).map((_, i) => (
          <span
            key={i}
            className={twMerge(
              'size-2 rounded-full',
              i < wins ? 'bg-gold shadow-[0_0_10px_rgba(248,189,62,0.85)]' : 'bg-pink-secondary/25'
            )}
          />
        ))}
      </span>

      {badge && (
        <span
          className={twMerge(
            'rounded-full border px-2 py-0.5 text-[10px] font-black tracking-[0.1em] uppercase',
            tone[badge.tone]
          )}
        >
          {badge.text}
        </span>
      )}
    </div>
  );
}
