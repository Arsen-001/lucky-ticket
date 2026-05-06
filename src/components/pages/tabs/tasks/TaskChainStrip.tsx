'use client';
import { useMemo } from 'react';
import {
  Award,
  Banknote,
  Bolt,
  CheckCircle,
  Coins,
  Cpu,
  Crown,
  Flame,
  Heart,
  type LucideIcon,
  Medal,
  Rocket,
  Star,
  Ticket,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { useGetAchievementsQuery } from '@/api/achievements.api';
import { findClosestUnlocks, type ChainStatus } from '@/utils/global/task-chain.utils';

const ICON_MAP: Record<string, LucideIcon> = {
  trophy: Trophy,
  users: Users,
  medal: Medal,
  ticket: Ticket,
  heart: Heart,
  cpu: Cpu,
  bolt: Bolt,
  banknote: Banknote,
  'check-circle': CheckCircle,
  flame: Flame,
  zap: Zap,
  crown: Crown,
  'user-plus': UserPlus,
  coins: Coins,
  star: Star,
  rocket: Rocket,
  award: Award,
  'trending-up': TrendingUp,
};

const PREVIEW_LIMIT = 3;

export function TaskChainStrip() {
  const { data } = useGetAchievementsQuery();

  const closest = useMemo(
    () => (data ? findClosestUnlocks(data.achievements, PREVIEW_LIMIT) : []),
    [data]
  );

  if (closest.length === 0) return null;

  return (
    <div className="-mx-4 mb-3 px-4">
      <div className="scrollbar-hidden flex gap-2 overflow-x-auto">
        {closest.map(chain => (
          <ChainStripItem key={chain.chainId} chain={chain} />
        ))}
      </div>
    </div>
  );
}

interface ChainStripItemProps {
  chain: ChainStatus;
}

function ChainStripItem({ chain }: ChainStripItemProps) {
  const Icon: LucideIcon = chain.iconCode ? (ICON_MAP[chain.iconCode] ?? Trophy) : Trophy;
  const remaining = Math.max(0, chain.target - chain.current);

  return (
    <div
      className="flex min-w-[230px] flex-shrink-0 flex-col gap-1.5 rounded-2xl border p-2.5 backdrop-blur-md"
      style={{
        borderColor: `${chain.nextTierDotColor}55`,
        background: `linear-gradient(135deg, ${chain.nextTierDotColor}15, ${chain.nextTierDotColor}05)`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
          style={{
            background: `${chain.nextTierDotColor}20`,
            color: chain.nextTierDotColor,
          }}
        >
          <Icon size={14} strokeWidth={2.4} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[11px] font-extrabold text-white">{chain.chainName}</span>
          <span
            className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: chain.nextTierDotColor }}
          >
            {chain.current}/{chain.target} → {chain.nextTierName}
          </span>
        </div>
        {remaining > 0 && remaining <= 3 && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider"
            style={{
              background: `${chain.nextTierDotColor}20`,
              color: chain.nextTierDotColor,
            }}
          >
            {remaining} left
          </span>
        )}
      </div>
      <div className="bg-background-overlay h-1 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${chain.percent}%`,
            background: chain.nextTierDotColor,
            boxShadow: `0 0 6px ${chain.nextTierDotColor}`,
          }}
        />
      </div>
    </div>
  );
}
