'use client';

import { twMerge } from 'tailwind-merge';
import { RoulettePrizeTile } from '@/components/pages/out-tabs/drawer/invite-friends/roulette/RoulettePrizeTile';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { RouletteSlot } from '@/types/interfaces/roulette.interfaces';

export interface InviteFriendsPromoPrizesProps {
  /** Витрина — уже отсортирована и обрезана. @see rouletteShowcase */
  slots: RouletteSlot[];
  /** Сколько друзей стоит один спин — число с сервера, правится в панели. */
  friendsPerSpin: number;
  /** Сколько призов в таблице ВСЕГО: витрина — выборка, и это надо сказать. */
  totalCount: number;
  className?: string;
}

/**
 * «За каждых N друзей — спин, и призов много разных».
 *
 * Плитки те же, что в самом барабане: приз, увиденный в промо, должен
 * узнаваться на экране друзей, а не оказаться другой картинкой того же слота.
 *
 * Лента скроллится в своём контейнере — модалка по горизонтали не едет.
 */
export function InviteFriendsPromoPrizes({
  slots,
  friendsPerSpin,
  totalCount,
  className,
}: InviteFriendsPromoPrizesProps) {
  const t = useAppTranslations();

  if (!slots.length) return null;

  return (
    <div className={twMerge('flex w-full flex-col gap-1.5', className)}>
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="text-sm leading-none">
          🎰
        </span>
        <p className="text-white-secondary min-w-0 flex-1 truncate text-[11px]">
          {t('roulette subtitle', { count: friendsPerSpin })}
        </p>
        <span className="text-gold flex-shrink-0 text-[10px] font-extrabold">
          {t('roulette prizes count', { count: totalCount })}
        </span>
      </div>

      <div className="scrollbar-hidden -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {slots.map(slot => (
          <RoulettePrizeTile
            key={slot.key}
            emoji={slot.emoji}
            title={slot.title}
            rarity={slot.rarity}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
}
