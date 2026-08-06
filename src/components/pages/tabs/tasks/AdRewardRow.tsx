import { twMerge } from 'tailwind-merge';
import { Coins, Sparkles, Star, Ticket, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';
import { TaskRewardType } from '@/types/enums/tasks.enums';
import type { TaskReward } from '@/types/interfaces/tasks.interfaces';
import { TIER_RANK, type TierName } from '@/types/types/tier.types';

interface RewardSkin {
  Icon: LucideIcon | null;
  iconClass: string;
  chipClass: string;
}

/**
 * Icon and colour per reward type. Deliberately the same pairing as
 * `TaskRewardBadge` — a star is `warning` and a coin is `gold` everywhere in
 * the app, and an ad slot is not the place to invent a second language.
 */
const SKIN: Record<TaskRewardType, RewardSkin> = {
  [TaskRewardType.LC]: {
    Icon: Coins,
    iconClass: 'text-gold',
    chipClass: 'border-gold/45 bg-gradient-to-b from-gold/24 to-gold/[0.04]',
  },
  [TaskRewardType.TICKETS]: {
    Icon: Ticket,
    iconClass: 'text-electric-pink',
    chipClass:
      'border-electric-pink/45 bg-gradient-to-b from-electric-pink/24 to-electric-pink/[0.04]',
  },
  [TaskRewardType.ACTIVITY_POINTS]: {
    Icon: null,
    iconClass: '',
    chipClass: 'border-teal/45 bg-gradient-to-b from-teal/24 to-teal/[0.04]',
  },
  [TaskRewardType.STARS]: {
    Icon: Star,
    iconClass: 'text-warning',
    chipClass: 'border-warning/50 bg-gradient-to-b from-warning/26 to-warning/[0.05]',
  },
  [TaskRewardType.PREMIUM]: {
    Icon: Sparkles,
    iconClass: 'text-pink',
    chipClass: 'border-pink/45 bg-gradient-to-b from-pink/24 to-pink/[0.04]',
  },
  [TaskRewardType.ENGINE]: {
    Icon: Trophy,
    iconClass: 'text-platinum',
    chipClass: 'border-platinum/45 bg-gradient-to-b from-platinum/24 to-platinum/[0.04]',
  },
};

/** Tier of a ticket reward, shown as a dot — the word never fits a quarter chip. */
const TIER_DOT: Record<TierName, string> = {
  bronze: 'bg-bronze',
  silver: 'bg-silver',
  gold: 'bg-gold',
  platinum: 'bg-platinum',
  diamond: 'bg-diamond',
};

const isTier = (label?: string): label is TierName => !!label && label in TIER_RANK;

/**
 * Exact below five figures, compact above. A view paying 150 000 LC is the one
 * case where the raw number cannot fit a quarter-width chip, and a clipped
 * "+150…" is worse than a rounded "150K".
 */
const formatAmount = (amount: number) =>
  amount >= 10_000 ? formatCompact(amount) : formatNumber(amount);

/**
 * The bolt is drawn rotated inside its box, so it reads a few pixels smaller
 * than a Lucide glyph asked for the same size. It gets the difference back.
 */
const BOLT_BONUS = 5;

export type AdRewardRowVariant = 'inline' | 'row';

export interface AdRewardRowProps {
  rewards: TaskReward[];
  /**
   * `inline` — one chip beside the title, for the common view that pays a
   * single thing. `row` — a full-width row of equal chips, because from two
   * rewards on there is no room beside a title and the second one would be the
   * one to get clipped.
   */
  variant?: AdRewardRowVariant;
  /** Dims the row for a slot that is spent or not reachable yet. */
  muted?: boolean;
  className?: string;
}

/**
 * What one ad view pays. A single view can grant up to four things at once —
 * activity points, LC, stars and a ticket with its own tier (see the backend's
 * `adViewRewardsApi`) — so the shape has to survive four chips at 390px, not
 * just the flat "+2 ⚡" the ladder defaults to.
 */
export function AdRewardRow({
  rewards,
  variant = 'row',
  muted = false,
  className,
}: AdRewardRowProps) {
  if (!rewards.length) return null;

  const inline = variant === 'inline';
  const dense = rewards.length >= 4;
  const iconSize = inline ? 20 : dense ? 15 : 17;
  const textClass = inline ? 'text-[15px]' : dense ? 'text-[12px]' : 'text-[13px]';

  return (
    <div
      className={twMerge(
        'relative flex items-stretch gap-1.5',
        inline && 'shrink-0',
        muted && 'opacity-60',
        className
      )}
    >
      {rewards.map((reward, index) => {
        const skin = SKIN[reward.type];
        if (!skin) return null;
        const { Icon, iconClass, chipClass } = skin;
        return (
          <span
            key={`${reward.type}-${index}`}
            className={twMerge(
              'flex min-w-0 items-center justify-center gap-1.5 rounded-xl border leading-none font-extrabold tabular-nums',
              inline ? 'px-2.5 py-2' : 'flex-1 px-1 py-2',
              textClass,
              chipClass
            )}
          >
            {Icon ? (
              <Icon size={iconSize} strokeWidth={2.2} className={twMerge('shrink-0', iconClass)} />
            ) : (
              <BoltIcon size={iconSize + BOLT_BONUS} />
            )}
            <span className="truncate text-white">
              {reward.type === TaskRewardType.ACTIVITY_POINTS ? '+' : ''}
              {formatAmount(reward.amount)}
            </span>
            {reward.type === TaskRewardType.TICKETS && isTier(reward.label) && (
              <span
                className={twMerge(
                  'size-1.5 shrink-0 rounded-full ring-1 ring-white/20',
                  TIER_DOT[reward.label]
                )}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
