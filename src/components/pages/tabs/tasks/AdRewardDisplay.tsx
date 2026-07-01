import { twMerge } from 'tailwind-merge';
import { Coins, Sparkles, Star, Ticket, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
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

export interface AdRewardDisplayProps {
  rewards: TaskReward[];
  className?: string;
}

export function AdRewardDisplay({ rewards, className }: AdRewardDisplayProps) {
  if (!rewards.length) return null;

  const count = rewards.length;
  const iconSize = count >= 3 ? 12 : 14;
  const amountSize = count >= 3 ? 'text-[10px]' : 'text-[11px]';

  return (
    <div className={twMerge('flex items-center gap-1', className)}>
      {rewards.map((reward, i) => {
        const style = STYLE_MAP[reward.type];
        if (!style) return null;
        const { Icon, iconClass, bgClass, ringClass } = style;
        return (
          <div
            key={`${reward.type}-${i}`}
            className={twMerge(
              'flex min-w-0 items-center gap-0.5 rounded-md border px-1 py-0.5',
              bgClass,
              ringClass
            )}
          >
            {Icon ? (
              <Icon size={iconSize} strokeWidth={2.4} className={twMerge('shrink-0', iconClass)} />
            ) : (
              <BoltIcon size={iconSize + 4} />
            )}
            <span
              className={twMerge('font-extrabold tabular-nums leading-none text-white', amountSize)}
            >
              +{reward.amount}
            </span>
          </div>
        );
      })}
    </div>
  );
}
