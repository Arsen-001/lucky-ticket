import { twMerge } from 'tailwind-merge';
import { Coins, Sparkles, Star, Ticket, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { TicketRewardIcon } from '@/components/shared/icons/TicketRewardIcon';
import { TaskRewardType } from '@/types/enums/tasks.enums';
import type { TaskReward } from '@/types/interfaces/tasks.interfaces';
import { asTicketTier } from '@/utils/global/ticket-tier.utils';

export interface TaskRewardBadgeProps {
  reward: TaskReward;
  /**
   * Tier of the task this reward belongs to — the tier its tickets are credited
   * to (the backend's `tierOf(task.tier)`, Bronze when the task names none).
   * The reward's own `label` wins when it carries one, as the ads ladder does.
   */
  tier?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ICON_MAP: Record<Exclude<TaskRewardType, TaskRewardType.ACTIVITY_POINTS>, LucideIcon> = {
  [TaskRewardType.LC]: Coins,
  [TaskRewardType.TICKETS]: Ticket,
  [TaskRewardType.STARS]: Star,
  [TaskRewardType.PREMIUM]: Sparkles,
  [TaskRewardType.ENGINE]: Trophy,
};

const COLOR_MAP: Record<TaskRewardType, string> = {
  [TaskRewardType.LC]: 'text-gold',
  [TaskRewardType.TICKETS]: 'text-electric-pink',
  [TaskRewardType.ACTIVITY_POINTS]: 'text-teal',
  [TaskRewardType.STARS]: 'text-warning',
  [TaskRewardType.PREMIUM]: 'text-pink',
  [TaskRewardType.ENGINE]: 'text-platinum',
};

const SIZE_MAP = {
  sm: { icon: 12, text: 'text-[11px]', padding: 'px-1.5 py-0.5 gap-1' },
  md: { icon: 14, text: 'text-xs', padding: 'px-2 py-0.5 gap-1' },
  lg: { icon: 16, text: 'text-sm', padding: 'px-2.5 py-1 gap-1.5' },
};

export function TaskRewardBadge({ reward, tier, size = 'md', className }: TaskRewardBadgeProps) {
  const cfg = SIZE_MAP[size];
  const Icon = reward.type !== TaskRewardType.ACTIVITY_POINTS ? ICON_MAP[reward.type] : null;
  const isTickets = reward.type === TaskRewardType.TICKETS;
  // Bronze is not a guess: every task-shaped ticket payout the backend makes
  // goes through `rewardOps`, whose tier defaults to Bronze — that is where a
  // task with no tier of its own (and one scoped to `all`) actually lands.
  const ticketTier = asTicketTier(reward.label) ?? asTicketTier(tier) ?? 'bronze';

  return (
    <div
      className={twMerge(
        'inline-flex items-center rounded-full bg-white/5 font-semibold tabular-nums',
        cfg.padding,
        cfg.text,
        COLOR_MAP[reward.type],
        className
      )}
    >
      {isTickets ? (
        <TicketRewardIcon tier={ticketTier} amount={reward.amount} size={cfg.icon} />
      ) : Icon ? (
        <Icon size={cfg.icon} className="shrink-0" />
      ) : (
        <BoltIcon size={cfg.icon + 6} />
      )}
      <span>+{reward.amount}</span>
    </div>
  );
}
