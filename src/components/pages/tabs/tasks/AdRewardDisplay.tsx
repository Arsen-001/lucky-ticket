'use client';

import { twMerge } from 'tailwind-merge';
import { Coins, Sparkles, Star, Ticket, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import { TaskRewardType } from '@/types/enums/tasks.enums';
import type { TaskReward } from '@/types/interfaces/tasks.interfaces';

interface RewardStyle {
  Icon: LucideIcon | null;
  iconClass: string;
  bgClass: string;
  glowClass: string;
  ringClass: string;
}

const STYLE_MAP: Record<TaskRewardType, RewardStyle> = {
  [TaskRewardType.LC]: {
    Icon: Coins,
    iconClass: 'text-gold',
    bgClass: 'bg-gradient-to-br from-gold/30 via-gold/10 to-transparent',
    glowClass: 'shadow-[0_0_14px_rgba(248,189,62,0.40)]',
    ringClass: 'border-gold/40',
  },
  [TaskRewardType.TICKETS]: {
    Icon: Ticket,
    iconClass: 'text-electric-pink',
    bgClass: 'bg-gradient-to-br from-electric-pink/30 via-electric-pink/10 to-transparent',
    glowClass: 'shadow-[0_0_14px_rgba(222,0,155,0.40)]',
    ringClass: 'border-electric-pink/40',
  },
  [TaskRewardType.ACTIVITY_POINTS]: {
    Icon: null,
    iconClass: '',
    bgClass: 'bg-gradient-to-br from-teal/30 via-teal/10 to-transparent',
    glowClass: 'shadow-[0_0_14px_rgba(79,138,130,0.45)]',
    ringClass: 'border-teal/40',
  },
  [TaskRewardType.STARS]: {
    Icon: Star,
    iconClass: 'text-warning',
    bgClass: 'bg-gradient-to-br from-warning/30 via-warning/10 to-transparent',
    glowClass: 'shadow-[0_0_14px_rgba(180,130,3,0.45)]',
    ringClass: 'border-warning/40',
  },
  [TaskRewardType.PREMIUM]: {
    Icon: Sparkles,
    iconClass: 'text-pink',
    bgClass: 'bg-gradient-to-br from-pink/30 via-pink/10 to-transparent',
    glowClass: 'shadow-[0_0_14px_rgba(198,113,189,0.40)]',
    ringClass: 'border-pink/40',
  },
  [TaskRewardType.ENGINE]: {
    Icon: Trophy,
    iconClass: 'text-platinum',
    bgClass: 'bg-gradient-to-br from-platinum/30 via-platinum/10 to-transparent',
    glowClass: 'shadow-[0_0_14px_rgba(192,190,177,0.40)]',
    ringClass: 'border-platinum/40',
  },
};

/**
 * Exact below five figures, compact above it. A slot paying 150 000 LC is the
 * one case where the raw number cannot fit a chip, and a clipped "+150…" on a
 * reward is worse than a rounded "+150K".
 */
const formatAmount = (amount: number) => (amount >= 10_000 ? formatCompact(amount) : `${amount}`);

export interface AdRewardDisplayProps {
  rewards: TaskReward[];
  /** Dims the whole container for slots that are spent or not yet reachable. */
  muted?: boolean;
  className?: string;
}

/**
 * The reward panel of an ad slide: a labelled, inset container holding one chip
 * per reward type. It is a container rather than a bare row of chips because on
 * a card that also carries a title, a hint and a CTA, unframed chips read as
 * decoration — the frame plus the «reward» caption says *this is what you get*.
 */
export function AdRewardDisplay({ rewards, muted = false, className }: AdRewardDisplayProps) {
  const t = useAppTranslations();

  if (!rewards.length) return null;

  // Chips share one row and always fill it, so they are sized by how many have
  // to fit: the common single-reward slot gets a big icon and a big number
  // instead of one small chip adrift in a wide box. At three the row is down to
  // ~52px per chip, which no longer fits icon and number side by side — they
  // stack instead, which frees the chip's whole width for the number.
  const count = rewards.length;
  const stacked = count >= 3;
  const iconSize = count === 1 ? 19 : count === 2 ? 16 : 14;
  const amountSize = count === 1 ? 'text-[15px]' : count === 2 ? 'text-[13px]' : 'text-[11px]';
  const chipPadding = count === 1 ? 'px-2 py-1.5' : count === 2 ? 'px-1.5 py-1' : 'px-1 py-1';

  return (
    <div
      className={twMerge(
        'relative rounded-xl border border-white/10 bg-black/25 px-2 pt-1.5 pb-2',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
        muted && 'opacity-80',
        className
      )}
    >
      <span className="block text-[8px] font-bold tracking-[0.16em] text-white/35 uppercase">
        {t('reward')}
      </span>

      <div className="mt-1.5 flex items-center gap-1.5">
        {rewards.map((reward, i) => {
          const style = STYLE_MAP[reward.type];
          if (!style) return null;
          const { Icon, iconClass, bgClass, ringClass, glowClass } = style;
          return (
            <div
              key={`${reward.type}-${i}`}
              className={twMerge(
                'flex min-w-0 flex-1 items-center justify-center rounded-lg border',
                stacked ? 'flex-col gap-0.5' : 'gap-1',
                chipPadding,
                bgClass,
                ringClass,
                // The type glow is what makes a rare reward feel rare; on a spent
                // slot it would keep shouting, so it is dropped along with the
                // rest of the card's emphasis.
                !muted && glowClass
              )}
            >
              {Icon ? (
                <Icon
                  size={iconSize}
                  strokeWidth={2.4}
                  className={twMerge('shrink-0', iconClass)}
                />
              ) : (
                <BoltIcon size={iconSize + 4} />
              )}
              <span
                className={twMerge(
                  'max-w-full truncate leading-none font-extrabold text-white tabular-nums',
                  amountSize
                )}
              >
                +{formatAmount(reward.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
