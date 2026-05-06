'use client';
import { useRef } from 'react';
import { Lock, Star, TicketCheck, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Achievement } from '@/components/shared/achievements/Achievement';
import { AchievementProgressBar } from '@/components/shared/achievements/AchievementProgressBar';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { AchievementRarity } from '@/types/enums/achievement.enums';
import type { Achievement as AchievementType } from '@/types/interfaces/achievement.interfaces';
import { rarityLabelKey } from '@/components/shared/achievements/achievement.utils';

const rarityCardClass: Record<AchievementRarity, string> = {
  [AchievementRarity.COMMON]:
    'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/5',
  [AchievementRarity.RARE]:
    'border-[#5FE3F5]/30 bg-[#5FE3F5]/[0.07] hover:border-[#5FE3F5]/55 hover:bg-[#5FE3F5]/10 shadow-[0_0_18px_rgba(95,227,245,0.14)]',
  [AchievementRarity.EPIC]:
    'border-[#A78BFA]/35 bg-[#A78BFA]/[0.08] hover:border-[#A78BFA]/60 hover:bg-[#A78BFA]/12 shadow-[0_0_20px_rgba(167,139,250,0.18)]',
  [AchievementRarity.LEGENDARY]:
    'border-[#F8BD3E]/35 bg-[#F8BD3E]/[0.08] hover:border-[#F8BD3E]/60 hover:bg-[#F8BD3E]/12 shadow-[0_0_24px_rgba(248,189,62,0.22)]',
  [AchievementRarity.MYTHIC]:
    'border-[#FF5FC8]/40 bg-[#FF5FC8]/[0.09] hover:border-[#FF5FC8]/65 hover:bg-[#FF5FC8]/14 shadow-[0_0_28px_rgba(255,95,200,0.26)]',
  [AchievementRarity.MYTHIC_PLUS]:
    'border-[#FFD700]/55 bg-[#FFD700]/[0.1] hover:border-[#FFD700]/80 hover:bg-[#FFD700]/15 shadow-[0_0_32px_rgba(255,215,0,0.3)]',
};

const rarityLockedCardClass: Record<AchievementRarity, string> = {
  [AchievementRarity.COMMON]:
    'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.035]',
  [AchievementRarity.RARE]:
    'border-[#5FE3F5]/15 bg-[#5FE3F5]/[0.03] hover:border-[#5FE3F5]/30 hover:bg-[#5FE3F5]/[0.05]',
  [AchievementRarity.EPIC]:
    'border-[#A78BFA]/18 bg-[#A78BFA]/[0.035] hover:border-[#A78BFA]/35 hover:bg-[#A78BFA]/[0.06]',
  [AchievementRarity.LEGENDARY]:
    'border-[#F8BD3E]/18 bg-[#F8BD3E]/[0.035] hover:border-[#F8BD3E]/35 hover:bg-[#F8BD3E]/[0.06]',
  [AchievementRarity.MYTHIC]:
    'border-[#FF5FC8]/22 bg-[#FF5FC8]/[0.04] hover:border-[#FF5FC8]/40 hover:bg-[#FF5FC8]/[0.07]',
  [AchievementRarity.MYTHIC_PLUS]:
    'border-[#FFD700]/25 bg-[#FFD700]/[0.05] hover:border-[#FFD700]/45 hover:bg-[#FFD700]/[0.08]',
};

const rarityLabelClass: Record<AchievementRarity, string> = {
  [AchievementRarity.COMMON]: 'text-white/45',
  [AchievementRarity.RARE]: 'text-[#5FE3F5]',
  [AchievementRarity.EPIC]: 'text-[#A78BFA]',
  [AchievementRarity.LEGENDARY]: 'text-[#F8BD3E]',
  [AchievementRarity.MYTHIC]: 'text-[#FF5FC8]',
  [AchievementRarity.MYTHIC_PLUS]: 'text-[#FFD700]',
};

const rarityLockedLabelClass: Record<AchievementRarity, string> = {
  [AchievementRarity.COMMON]: 'text-white/35',
  [AchievementRarity.RARE]: 'text-[#5FE3F5]/55',
  [AchievementRarity.EPIC]: 'text-[#A78BFA]/55',
  [AchievementRarity.LEGENDARY]: 'text-[#F8BD3E]/55',
  [AchievementRarity.MYTHIC]: 'text-[#FF5FC8]/60',
  [AchievementRarity.MYTHIC_PLUS]: 'text-[#FFD700]/60',
};

export interface AchievementCardProps {
  achievement: AchievementType;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
  showProgress?: boolean;
  comingSoon?: boolean;
}

export function AchievementCard({
  achievement,
  onClick,
  onLongPress,
  className,
  showProgress = true,
  comingSoon,
}: AchievementCardProps) {
  const t = useAppTranslations();

  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressedLongRef = useRef(false);

  const startPress = () => {
    pressedLongRef.current = false;
    if (onLongPress) {
      pressTimerRef.current = setTimeout(() => {
        pressedLongRef.current = true;
        onLongPress();
      }, 350);
    }
  };

  const endPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleClick = () => {
    if (pressedLongRef.current) return;
    onClick?.();
  };

  const isLocked = !achievement.earned;
  const cardTone = comingSoon
    ? 'border-white/8 bg-white/[0.015] hover:border-white/12'
    : isLocked
      ? rarityLockedCardClass[achievement.rarity]
      : rarityCardClass[achievement.rarity];

  const labelTone = comingSoon
    ? 'text-white/30'
    : isLocked
      ? rarityLockedLabelClass[achievement.rarity]
      : rarityLabelClass[achievement.rarity];

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      className={twMerge(
        'relative flex h-full min-h-[170px] flex-col items-center rounded-2xl border p-3 transition-all active:scale-95',
        cardTone,
        className
      )}
    >
      {isLocked && !comingSoon && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 z-2 flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/85 backdrop-blur-sm"
        >
          <Lock size={10} strokeWidth={2.6} />
        </span>
      )}
      {comingSoon && (
        <span
          aria-label="Coming soon"
          className="text-electric-pink absolute right-1.5 top-1.5 z-2 inline-flex items-center rounded-full border border-electric-pink/40 bg-electric-pink/15 px-1.5 py-0.5 text-[8px] font-extrabold tracking-wider backdrop-blur-sm"
        >
          SOON
        </span>
      )}

      <div className="flex flex-1 items-center justify-center">
        <Achievement achievement={achievement} size="md" />
      </div>

      <div className="flex w-full flex-col items-center gap-0.5">
        <span className="line-clamp-1 w-full text-center text-xs font-bold text-white/90">
          {achievement.name}
        </span>
        <span className={twMerge('text-[10px] font-bold uppercase tracking-wider', labelTone)}>
          {achievement.rarity === AchievementRarity.MYTHIC_PLUS && achievement.tier
            ? achievement.tier.max === 0
              ? `Mythic+ · Lv ${achievement.tier.current} · ∞`
              : `Mythic+ · Lv ${achievement.tier.current}/${achievement.tier.max}`
            : t(rarityLabelKey(achievement.rarity))}
        </span>
      </div>

      <div className="mt-2 h-1.5 w-full">
        {showProgress && !achievement.earned && achievement.progress && (
          <AchievementProgressBar
            current={achievement.progress.current}
            target={achievement.progress.target}
            className="w-full"
            showLabel={false}
          />
        )}
      </div>

      {achievement.chainReward && (
        <div className="mt-1.5 flex w-full flex-wrap items-center justify-center gap-1">
          {achievement.chainReward.tickets ? (
            <RewardChip
              icon={TicketCheck}
              label={`+${achievement.chainReward.tickets}`}
              color="#4DB85F"
            />
          ) : null}
          {achievement.chainReward.activityPoints ? (
            <RewardChip
              icon={Zap}
              label={`+${achievement.chainReward.activityPoints}`}
              color="#FF5FC8"
            />
          ) : null}
          {achievement.chainReward.ls ? (
            <RewardChip icon={Star} label={`+${achievement.chainReward.ls}`} color="#F8BD3E" />
          ) : null}
        </div>
      )}
    </button>
  );
}

interface RewardChipProps {
  icon: typeof Star;
  label: string;
  color: string;
}

function RewardChip({ icon: Icon, label, color }: RewardChipProps) {
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-extrabold tabular-nums"
      style={{
        borderColor: `${color}55`,
        background: `${color}14`,
        color,
      }}
    >
      <Icon size={9} strokeWidth={2.6} />
      {label}
    </span>
  );
}
