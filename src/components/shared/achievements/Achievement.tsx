'use client';
import { type CSSProperties, type ReactNode } from 'react';
import {
  Anchor,
  Award,
  BadgeCheck,
  Banknote,
  Bolt,
  Brain,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  Coins,
  Cpu,
  Crown,
  Flame,
  FlaskConical,
  Gauge,
  Gem,
  Handshake,
  Heart,
  Infinity as InfinityIcon,
  type LucideIcon,
  Medal,
  PiggyBank,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  Sun,
  Swords,
  Target,
  Ticket as TicketIcon,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { AchievementRarity } from '@/types/enums/achievement.enums';
import type { Achievement as AchievementType } from '@/types/interfaces/achievement.interfaces';
import '@/styles/components/achievement.css';

const iconMap: Record<string, LucideIcon> = {
  'shield-check': ShieldCheck,
  'badge-check': BadgeCheck,
  crown: Crown,
  sparkles: Sparkles,
  gem: Gem,
  ticket: TicketIcon,
  cpu: Cpu,
  gauge: Gauge,
  zap: Zap,
  rocket: Rocket,
  trophy: Trophy,
  medal: Medal,
  swords: Swords,
  target: Target,
  flame: Flame,
  bolt: Bolt,
  brain: Brain,
  infinity: InfinityIcon,
  'trending-up': TrendingUp,
  'user-plus': UserPlus,
  users: Users,
  handshake: Handshake,
  heart: Heart,
  star: Star,
  coins: Coins,
  banknote: Banknote,
  wallet: Wallet,
  'piggy-bank': PiggyBank,
  'check-circle': CheckCircle,
  'calendar-check': CalendarCheck,
  'calendar-days': CalendarDays,
  sun: Sun,
  'refresh-cw': RefreshCw,
  anchor: Anchor,
  flask: FlaskConical,
  snowflake: Snowflake,
};

const rarityIconColor: Record<AchievementRarity, string> = {
  [AchievementRarity.COMMON]: '#FFFFFF',
  [AchievementRarity.RARE]: '#5FE3F5',
  [AchievementRarity.EPIC]: '#A78BFA',
  [AchievementRarity.LEGENDARY]: '#F8BD3E',
  [AchievementRarity.MYTHIC]: '#FF5FC8',
  [AchievementRarity.MYTHIC_PLUS]: '#FFD700',
};

export type AchievementSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizePx: Record<AchievementSize, number> = {
  xs: 36,
  sm: 52,
  md: 72,
  lg: 96,
  xl: 140,
};

const iconSize: Record<AchievementSize, number> = {
  xs: 16,
  sm: 22,
  md: 28,
  lg: 38,
  xl: 56,
};

export interface AchievementProps {
  achievement: AchievementType;
  size?: AchievementSize;
  className?: string;
  classNames?: {
    wrapper?: string;
    icon?: string;
    overlay?: string;
  };
  overlay?: ReactNode;
  style?: CSSProperties;
}

export function Achievement({
  achievement,
  size = 'md',
  className,
  classNames,
  overlay,
  style,
}: AchievementProps) {
  const Icon: LucideIcon =
    (achievement.iconCode ? iconMap[achievement.iconCode] : undefined) ?? Award;
  const px = sizePx[size];
  const isLocked = !achievement.earned;
  const rarityColor = rarityIconColor[achievement.rarity];

  return (
    <div
      style={{ width: px, height: px, ...style }}
      className={twMerge(
        'relative inline-flex flex-shrink-0 items-center justify-center',
        className
      )}
    >
      <Icon
        size={iconSize[size]}
        strokeWidth={2}
        className={twMerge('relative z-1', classNames?.icon)}
        style={{
          color: rarityColor,
          opacity: isLocked ? 0.5 : 1,
          filter: isLocked
            ? `drop-shadow(0 0 4px ${rarityColor}33)`
            : `drop-shadow(0 0 8px ${rarityColor}66)`,
        }}
      />
      {overlay && (
        <div className={twMerge('pointer-events-none absolute inset-0', classNames?.overlay)}>
          {overlay}
        </div>
      )}
    </div>
  );
}
