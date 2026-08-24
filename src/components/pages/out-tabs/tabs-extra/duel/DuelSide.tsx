'use client';

import { twMerge } from 'tailwind-merge';
import { DuelPlayerAvatar } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPlayerAvatar';

export interface DuelSideProps {
  name: string;
  /**
   * Имя для КРУЖКА, когда подпись — не имя.
   *
   * Своя сторона подписана словом «Вы», и без этого поля кружок рисовал букву
   * «В» — первую букву слова, а не игрока. Аватарки может не быть (её нет у
   * большинства), поэтому буква — это то, что видит человек чаще картинки.
   */
  avatarName?: string;
  avatarUrl?: string;
  /**
   * Счёт партии: сколько побед у этой стороны и сколько берёт матч.
   *
   * `null` — счёта нет: на фазе готовности матч ещё не начался, и ноль там не
   * значит ничего.
   */
  wins: number | null;
  winsNeeded: number;
  /** Ведёт — табло горит. */
  leading?: boolean;
  /** Бейдж состояния: «сходил». Пусто — бейджа нет. */
  badge?: { text: string; tone: 'ready' | 'moved' | 'idle' } | null;
  ringed?: boolean;
  className?: string;
}

/**
 * Подпись стороны: аватар, имя и счёт партии.
 *
 * Счёт цифрой, а не точками: две точки по восемь пикселей не отвечали ни «чей
 * это счёт», ни «сколько нужно всего» — зажжённая читалась и как «одна
 * победа», и как «одна попытка». «1/2» рядом со своим именем говорит и то и
 * другое, и размером с цифру на табло, а не подписью.
 */
export function DuelSide({
  name,
  avatarName,
  avatarUrl,
  wins,
  winsNeeded,
  leading,
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
    <div className={twMerge('flex items-center justify-center gap-2.5', className)}>
      <DuelPlayerAvatar name={avatarName ?? name} avatarUrl={avatarUrl} size={30} ready={ringed} />
      <span className="text-gray-secondary max-w-[8rem] truncate text-[13px] font-semibold">
        {name}
      </span>

      {wins !== null && (
        <span
          className={twMerge(
            'duel-rim flex items-baseline gap-px rounded-[10px] px-2.5 pt-0.5 pb-1',
            leading && 'duel-rim-on'
          )}
        >
          <b
            className={twMerge(
              'text-[26px] leading-none font-extrabold tabular-nums',
              wins > 0 ? 'text-gold' : 'text-pink-secondary/75'
            )}
          >
            {wins}
          </b>
          <i className="text-disabled text-[13px] font-extrabold not-italic">/{winsNeeded}</i>
        </span>
      )}

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
