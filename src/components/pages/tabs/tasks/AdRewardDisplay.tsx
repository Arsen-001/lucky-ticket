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
  /** Fill of a chip, used when several rewards share the row. */
  chipClass: string;
  /** Fill of the whole panel, used when the slot pays exactly one reward. */
  panelClass: string;
  ringClass: string;
  /**
   * The halo that makes a rare reward feel rare. Deliberately faint: it sits
   * inside a card that already carries a rarity frame and its own glow, and at
   * the old 14px/0.40 the three of them stacked into a permanent smear.
   */
  glowClass: string;
}

const STYLE_MAP: Record<TaskRewardType, RewardStyle> = {
  [TaskRewardType.LC]: {
    Icon: Coins,
    iconClass: 'text-gold',
    chipClass: 'bg-gradient-to-br from-gold/30 via-gold/10 to-transparent',
    panelClass: 'bg-gradient-to-b from-gold/16 via-gold/5 to-transparent',
    glowClass: 'shadow-[0_0_10px_rgba(248,189,62,0.22)]',
    ringClass: 'border-gold/35',
  },
  [TaskRewardType.TICKETS]: {
    Icon: Ticket,
    iconClass: 'text-electric-pink',
    chipClass: 'bg-gradient-to-br from-electric-pink/30 via-electric-pink/10 to-transparent',
    panelClass: 'bg-gradient-to-b from-electric-pink/16 via-electric-pink/5 to-transparent',
    glowClass: 'shadow-[0_0_10px_rgba(222,0,155,0.22)]',
    ringClass: 'border-electric-pink/35',
  },
  [TaskRewardType.ACTIVITY_POINTS]: {
    Icon: null,
    iconClass: '',
    chipClass: 'bg-gradient-to-br from-teal/30 via-teal/10 to-transparent',
    panelClass: 'bg-gradient-to-b from-teal/16 via-teal/5 to-transparent',
    glowClass: 'shadow-[0_0_10px_rgba(79,138,130,0.25)]',
    ringClass: 'border-teal/35',
  },
  [TaskRewardType.STARS]: {
    Icon: Star,
    iconClass: 'text-warning',
    chipClass: 'bg-gradient-to-br from-warning/30 via-warning/10 to-transparent',
    panelClass: 'bg-gradient-to-b from-warning/16 via-warning/5 to-transparent',
    glowClass: 'shadow-[0_0_10px_rgba(180,130,3,0.25)]',
    ringClass: 'border-warning/35',
  },
  [TaskRewardType.PREMIUM]: {
    Icon: Sparkles,
    iconClass: 'text-pink',
    chipClass: 'bg-gradient-to-br from-pink/30 via-pink/10 to-transparent',
    panelClass: 'bg-gradient-to-b from-pink/16 via-pink/5 to-transparent',
    glowClass: 'shadow-[0_0_10px_rgba(198,113,189,0.22)]',
    ringClass: 'border-pink/35',
  },
  [TaskRewardType.ENGINE]: {
    Icon: Trophy,
    iconClass: 'text-platinum',
    chipClass: 'bg-gradient-to-br from-platinum/30 via-platinum/10 to-transparent',
    panelClass: 'bg-gradient-to-b from-platinum/16 via-platinum/5 to-transparent',
    glowClass: 'shadow-[0_0_10px_rgba(192,190,177,0.22)]',
    ringClass: 'border-platinum/35',
  },
};

/**
 * Exact below five figures, compact above it. A slot paying 150 000 LC is the
 * one case where the raw number cannot fit a chip, and a clipped "+150…" on a
 * reward is worse than a rounded "+150K".
 */
const formatAmount = (amount: number) => (amount >= 10_000 ? formatCompact(amount) : `${amount}`);

/**
 * The bolt is drawn rotated inside its box, so it reads a few pixels smaller
 * than a Lucide glyph asked for the same size. It gets the difference back.
 */
const BOLT_BONUS = 5;

export interface AdRewardDisplayProps {
  rewards: TaskReward[];
  /** Dims the whole container for slots that are spent or not yet reachable. */
  muted?: boolean;
  className?: string;
}

/**
 * The reward panel of an ad slide: a labelled, framed container saying *this is
 * what you get*. Unframed chips on a card that also carries a title, a hint and
 * a CTA read as decoration, so the frame is what earns the panel its place.
 *
 * How many rewards there are changes the shape of the panel, not just its
 * spacing:
 *
 *  - **One** (every slot in the current ladder) — the panel itself becomes the
 *    reward: it takes the type's tint and its ring, and holds one large icon
 *    next to one large number. There is no inner chip, because a frame drawn
 *    inside another frame is what forced the old icon down to 19px.
 *  - **Two or three** — the row is shared, so each reward gets its own chip
 *    back; at three there is no longer room for icon and number side by side
 *    and they stack, which frees the chip's whole width for the number.
 */
export function AdRewardDisplay({ rewards, muted = false, className }: AdRewardDisplayProps) {
  const t = useAppTranslations();

  if (!rewards.length) return null;

  const count = rewards.length;
  const single = count === 1;
  const stacked = count >= 3;
  const iconSize = single ? 30 : count === 2 ? 21 : 16;
  const amountSize = single ? 'text-[19px]' : count === 2 ? 'text-[13px]' : 'text-[11px]';
  const chipPadding = count === 2 ? 'px-1.5 py-1' : 'px-1 py-1';

  const sole = single ? STYLE_MAP[rewards[0].type] : null;

  return (
    <div
      className={twMerge(
        'relative overflow-hidden rounded-xl border px-2 pt-1.5 pb-2',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
        sole
          ? twMerge('bg-black/20', sole.panelClass, sole.ringClass, !muted && sole.glowClass)
          : 'border-white/10 bg-black/25',
        muted && 'opacity-80',
        className
      )}
    >
      <span className="block text-center text-[8px] font-bold tracking-[0.16em] text-white/40 uppercase">
        {t('reward')}
      </span>

      <div
        className={twMerge(
          'flex items-center justify-center',
          single ? 'mt-1 gap-2' : 'mt-1.5 gap-1.5'
        )}
      >
        {rewards.map((reward, i) => {
          const style = STYLE_MAP[reward.type];
          if (!style) return null;
          const { Icon, iconClass, chipClass, ringClass, glowClass } = style;
          return (
            <div
              key={`${reward.type}-${i}`}
              className={twMerge(
                'flex min-w-0 items-center justify-center',
                single
                  ? 'gap-2'
                  : twMerge(
                      'flex-1 rounded-lg border',
                      stacked ? 'flex-col gap-0.5' : 'gap-1',
                      chipPadding,
                      chipClass,
                      ringClass,
                      // On a spent slot the halo would keep shouting, so it goes
                      // with the rest of the card's emphasis.
                      !muted && glowClass
                    )
              )}
            >
              {Icon ? (
                <Icon
                  size={iconSize}
                  strokeWidth={single ? 2 : 2.4}
                  className={twMerge('shrink-0', iconClass)}
                />
              ) : (
                <BoltIcon size={iconSize + BOLT_BONUS} />
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
