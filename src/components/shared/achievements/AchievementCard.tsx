'use client';
import { type CSSProperties, useRef } from 'react';
import { Bookmark, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Achievement } from '@/components/shared/achievements/Achievement';
import { AchievementRarity } from '@/types/enums/achievement.enums';
import type { Achievement as AchievementType } from '@/types/interfaces/achievement.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { rarityLabelKey } from '@/components/shared/achievements/achievement.utils';

const rarityColor: Record<AchievementRarity, string> = {
  [AchievementRarity.BRONZE]: '#E08A3A',
  [AchievementRarity.SILVER]: '#5FE3F5',
  [AchievementRarity.GOLD]: '#A78BFA',
  [AchievementRarity.PLATINUM]: '#F8BD3E',
  [AchievementRarity.DIAMOND]: '#FF5FC8',
  [AchievementRarity.DIAMOND_PLUS]: '#FFD700',
};

function cardStyle(rarity: AchievementRarity, locked: boolean): CSSProperties {
  const c = rarityColor[rarity];
  return {
    background: `
      linear-gradient(var(--color-background-overlay), var(--color-background-overlay)) padding-box,
      linear-gradient(
        180deg,
        rgba(255,255,255,0.07) 0%,
        rgba(255,255,255,0.02) 40%,
        ${c}66 80%,
        ${c} 100%
      ) border-box
    `,
    border: '1px solid transparent',
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px -8px ${c}${locked ? '22' : '55'}`,
    opacity: locked ? 0.55 : 1,
  };
}

export interface AchievementCardProps {
  achievement: AchievementType;
  onClick?: () => void;
  onLongPress?: () => void;
  onPin?: () => void;
  className?: string;
  showProgress?: boolean;
  comingSoon?: boolean;
}

export function AchievementCard({
  achievement,
  onClick,
  onLongPress,
  onPin,
  className,
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
  const c = rarityColor[achievement.rarity];

  const rarityLabel =
    achievement.rarity === AchievementRarity.DIAMOND_PLUS && achievement.tier
      ? achievement.tier.max === 0
        ? `${t(rarityLabelKey(achievement.rarity))} · ${t('level short')} ${achievement.tier.current} · ∞`
        : `${t(rarityLabelKey(achievement.rarity))} · ${t('level short')} ${achievement.tier.current}/${achievement.tier.max}`
      : t(rarityLabelKey(achievement.rarity));

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      style={cardStyle(achievement.rarity, isLocked)}
      className={twMerge(
        'relative flex h-full w-full flex-col items-center gap-2 rounded-2xl p-3 transition-transform active:scale-95',
        className
      )}
    >
      {isLocked ? (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 z-2 flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/85 backdrop-blur-sm"
        >
          <Lock size={10} strokeWidth={2.6} />
        </span>
      ) : onPin ? (
        <span
          role="button"
          aria-label={t('pin')}
          tabIndex={0}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            onPin();
          }}
          className="absolute right-0 top-0 z-2 flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/55 backdrop-blur-sm transition-colors hover:border-electric-pink/50 hover:bg-electric-pink/15"
          style={
            achievement.isPinned
              ? { borderColor: 'rgba(255,95,200,0.5)', background: 'rgba(255,95,200,0.18)' }
              : undefined
          }
        >
          <Bookmark
            size={15}
            strokeWidth={2.6}
            style={{ color: achievement.isPinned ? '#FF5FC8' : 'rgba(255,255,255,0.7)' }}
            fill={achievement.isPinned ? '#FF5FC8' : 'none'}
          />
        </span>
      ) : null}

      <span
        className="rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest"
        style={{
          color: c,
          background: `${c}18`,
          border: `1px solid ${c}44`,
        }}
      >
        {rarityLabel}
      </span>

      <div className="flex flex-1 items-center justify-center">
        <Achievement achievement={achievement} size="md" />
      </div>

      <span className="line-clamp-2 w-full text-center text-[11px] font-bold leading-tight text-white/90">
        {achievement.name}
      </span>
    </button>
  );
}
