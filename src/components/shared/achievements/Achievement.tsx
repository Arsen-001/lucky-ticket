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
  Eye,
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
import { AchievementCategory, AchievementRarity } from '@/types/enums/achievement.enums';
import type { Achievement as AchievementType } from '@/types/interfaces/achievement.interfaces';
import '@/styles/components/achievement.css';

const iconMap: Record<string, LucideIcon> = {
  'shield-check': ShieldCheck,
  'badge-check': BadgeCheck,
  crown: Crown,
  eye: Eye,
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
  [AchievementRarity.BRONZE]: '#FFFFFF',
  [AchievementRarity.SILVER]: '#5FE3F5',
  [AchievementRarity.GOLD]: '#A78BFA',
  [AchievementRarity.PLATINUM]: '#F8BD3E',
  [AchievementRarity.DIAMOND]: '#FF5FC8',
  [AchievementRarity.DIAMOND_PLUS]: '#FFD700',
};

type RarityImageMap = Record<AchievementRarity, string>;

const mkMap = (prefix: string, goldTier: 'gold' | 'golden' = 'gold'): RarityImageMap => ({
  [AchievementRarity.BRONZE]: `/assets/icons/badges/bronze-${prefix}.webp`,
  [AchievementRarity.SILVER]: `/assets/icons/badges/silver-${prefix}.webp`,
  [AchievementRarity.GOLD]: `/assets/icons/badges/${goldTier}-${prefix}.webp`,
  [AchievementRarity.PLATINUM]: `/assets/icons/badges/platinum-${prefix}.webp`,
  [AchievementRarity.DIAMOND]: `/assets/icons/badges/diamond-${prefix}.webp`,
  [AchievementRarity.DIAMOND_PLUS]: `/assets/icons/badges/diamond-plus-${prefix}.webp`,
});

const badgeByCategoryMap: Partial<Record<AchievementCategory, RarityImageMap>> = {
  [AchievementCategory.STATUS]: mkMap('profile-badge'),
  [AchievementCategory.TICKETS]: mkMap('ticket-badge'),
  [AchievementCategory.ACTIVITY_POINTS]: mkMap('activity-badge', 'golden'),
};

const badgeByIconCodeMap: Partial<Record<string, RarityImageMap>> = {
  trophy: mkMap('1st-badge', 'golden'),
  crown: mkMap('1st-badge', 'golden'),
  'trending-up': mkMap('2nd-badge'),
  medal: mkMap('3th-badge', 'golden'),
};

const tournamentBadgeMap: RarityImageMap = {
  [AchievementRarity.BRONZE]: '/assets/icons/badges/bronze-tournament-badge.webp',
  [AchievementRarity.SILVER]: '/assets/icons/badges/silver-tournament-badge.webp',
  [AchievementRarity.GOLD]: '/assets/icons/badges/golden-tournament-badge.webp',
  [AchievementRarity.PLATINUM]: '/assets/icons/badges/platinum-tournament-badge.webp',
  [AchievementRarity.DIAMOND]: '/assets/icons/badges/diamond-tournament-badge.webp',
  [AchievementRarity.DIAMOND_PLUS]: '/assets/icons/badges/diamon-plus-tournament-badge.webp',
};

const resolveBadgeSrc = (achievement: AchievementType): string | undefined => {
  if (achievement.category === AchievementCategory.TOURNAMENTS) {
    const byIcon = achievement.iconCode
      ? badgeByIconCodeMap[achievement.iconCode]?.[achievement.rarity]
      : undefined;
    return byIcon ?? tournamentBadgeMap[achievement.rarity];
  }
  return (
    badgeByCategoryMap[achievement.category]?.[achievement.rarity] ??
    (achievement.iconCode
      ? badgeByIconCodeMap[achievement.iconCode]?.[achievement.rarity]
      : undefined)
  );
};

export type AchievementSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

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
  const isLocked = !achievement.earned;
  const badgeSrc = resolveBadgeSrc(achievement);
  const Icon: LucideIcon =
    (achievement.iconCode ? iconMap[achievement.iconCode] : undefined) ?? Award;
  const rarityColor = rarityIconColor[achievement.rarity];

  return (
    <div
      style={badgeSrc ? style : { width: 72, height: 72, ...style }}
      className={twMerge(
        'relative inline-flex flex-shrink-0 items-center justify-center',
        className
      )}
    >
      {badgeSrc ? (
        //TODO: Next js Image component add spaces from edges
        <img
          src={badgeSrc}
          alt={achievement.name}
          className={twMerge('relative z-1 w-30 h-30 object-contain', classNames?.icon)}
          style={{ opacity: isLocked ? 0.4 : 1 }}
        />
      ) : (
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
      )}
      {overlay && (
        <div className={twMerge('pointer-events-none absolute inset-0', classNames?.overlay)}>
          {overlay}
        </div>
      )}
    </div>
  );
}
