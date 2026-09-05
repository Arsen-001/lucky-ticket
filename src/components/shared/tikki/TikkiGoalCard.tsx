'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import type { TikkiGoal } from './tikki.goal';
import { tikkiImages } from './tikki.images';
import { TikkiGoalSlots } from './TikkiGoalSlots';

export interface TikkiGoalCardProps {
  goal: TikkiGoal;
  balance: number;
  onBuy: () => void;
  onMerge: () => void;
  className?: string;
}

/**
 * Карточка ближайшей цели под счётом — 72 px: следующий тир, сколько собрано
 * из четырёх, цена шага и кнопка.
 *
 * Стоит на месте, где с одним Тикки было пустое небо, и превращает его в
 * воронку: один из четырёх → купить → сплав, всё на одном экране. Набралось
 * четыре — та же карточка зовёт сплавлять, лента подтверждает призраками.
 *
 * Целью служит вся карточка, а не одна кнопка: 72×362 против 60×28. Нет денег
 * — кнопка гаснет, как стрелка у чипа, но окно покупки открывается всё равно:
 * там написано, сколько не хватает.
 */
export function TikkiGoalCard({ goal, balance, onBuy, onMerge, className }: TikkiGoalCardProps) {
  const t = useAppTranslations();
  const poor = balance < goal.price;
  const nextName = t(goal.next);
  const collected = Math.min(goal.count, goal.size);

  return (
    <button
      type="button"
      onClick={goal.ready ? onMerge : onBuy}
      aria-label={goal.ready ? t('merge') : t('buy tikki')}
      data-testid="tikki-goal"
      className={twMerge(
        'grid h-[72px] w-full grid-cols-[auto_1fr_auto] items-center gap-2.5 rounded-2xl pe-3 ps-2.5 text-start',
        'bg-[rgba(20,18,36,0.62)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-[2px]',
        'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        className
      )}
    >
      <Image
        src={tikkiImages[goal.next].idle}
        alt=""
        width={44}
        height={48}
        className="h-12 w-11 object-contain"
      />

      <span className="flex min-w-0 flex-col gap-px">
        <span className="text-muted text-[9px] font-extrabold uppercase leading-[1.4] tracking-[0.09em]">
          {goal.ready ? t('merge ready') : t('next goal')}
        </span>
        <span className="truncate text-[15px] font-extrabold leading-tight text-white">
          {goal.ready
            ? t('merge into {tier}', { tier: nextName })
            : t('{tier} tikki', { tier: nextName })}
        </span>
        <span className="text-white-secondary flex items-center gap-1.5 whitespace-nowrap text-[10.5px] font-semibold leading-[1.4] tabular-nums">
          <TikkiGoalSlots count={collected} size={goal.size} tier={goal.tier} />
          {collected} {t('of {total}', { total: goal.size })} · {t(goal.tier)}
        </span>
      </span>

      <span className="grid justify-items-end gap-1.5">
        <span className="flex items-center gap-1 text-xs font-extrabold text-white tabular-nums">
          <CoinIcon size={12} />
          {formatCompact(goal.price)}
        </span>
        <span
          className={twMerge(
            'rounded-full px-2.5 py-1.5 text-[9.5px] font-extrabold uppercase leading-none tracking-[0.09em]',
            poor
              ? 'bg-white/8 text-[#7d7391]'
              : 'bg-pink-gradient text-white shadow-[0_8px_18px_-10px_#de009b]'
          )}
        >
          {goal.ready ? t('merge') : t('buy')}
        </span>
      </span>
    </button>
  );
}
