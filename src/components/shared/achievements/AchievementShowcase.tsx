'use client';
import { useRef } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { Achievement } from '@/components/shared/achievements/Achievement';
import { AchievementAddSlot } from '@/components/shared/achievements/AchievementAddSlot';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { calcShowcaseSlotPrice } from '@/constants/global.constants';
import type { Achievement as AchievementType } from '@/types/interfaces/achievement.interfaces';
import '@/styles/components/profile.css';

export interface AchievementShowcaseProps {
  pinnedAchievements: AchievementType[];
  showcaseSlots: number;
  showcaseMaxSlots: number;
  totalEarned: number;
  totalAchievements: number;
  isOwn: boolean;
  onTapSlot?: (slot: number, achievement: AchievementType | null) => void;
  onLongPressSlot?: (slot: number, achievement: AchievementType | null) => void;
  /** Called when the owner buys the next showcase slot. */
  onAddSlot?: () => void;
  className?: string;
}

export function AchievementShowcase({
  pinnedAchievements,
  showcaseSlots,
  showcaseMaxSlots,
  totalEarned,
  totalAchievements,
  isOwn,
  onTapSlot,
  onLongPressSlot,
  onAddSlot,
  className,
}: AchievementShowcaseProps) {
  const t = useAppTranslations();
  const slotByIndex = new Map<number, AchievementType>();
  pinnedAchievements.forEach(a => {
    if (a.pinnedSlot != null) slotByIndex.set(a.pinnedSlot, a);
  });

  const slotCount = Math.max(showcaseSlots || 0, 1);
  const slots = Array.from({ length: slotCount }).map((_, i) => slotByIndex.get(i) ?? null);
  const canBuySlot = isOwn && showcaseSlots < showcaseMaxSlots;

  return (
    <section className={twMerge('flex flex-col gap-3', className)}>
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-base font-extrabold text-white">{t('showcase')}</h3>
          <span className="text-[11px] text-white/50">
            {pinnedAchievements.length} / {showcaseSlots} {t('pinned')}
          </span>
        </div>
        {isOwn && (
          <Link
            href={routes.profile.achievements}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-electric-pink"
          >
            {t('view all')} ({totalEarned}/{totalAchievements})
            <ChevronRight size={12} />
          </Link>
        )}
      </header>

      <div className="grid grid-cols-3 gap-2.5">
        {slots.map((ach, i) => (
          <ShowcaseSlot
            key={i}
            achievement={ach}
            isOwn={isOwn}
            onTap={() => onTapSlot?.(i, ach)}
            onLongPress={() => onLongPressSlot?.(i, ach)}
            animationDelay={i * 80}
          />
        ))}
        {canBuySlot && (
          <AchievementAddSlot
            costLs={calcShowcaseSlotPrice(showcaseSlots)}
            onClick={onAddSlot}
            className="aspect-square h-auto w-full"
          />
        )}
      </div>
    </section>
  );
}

interface ShowcaseSlotProps {
  achievement: AchievementType | null;
  isOwn: boolean;
  onTap: () => void;
  onLongPress: () => void;
  animationDelay: number;
}

function ShowcaseSlot({
  achievement,
  isOwn,
  onTap,
  onLongPress,
  animationDelay,
}: ShowcaseSlotProps) {
  const t = useAppTranslations();
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressedLongRef = useRef(false);

  const startPress = () => {
    pressedLongRef.current = false;
    if (isOwn && achievement) {
      pressTimerRef.current = setTimeout(() => {
        pressedLongRef.current = true;
        onLongPress();
      }, 350);
    }
  };
  const endPress = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = null;
  };
  const handleClick = () => {
    if (pressedLongRef.current) return;
    onTap();
  };

  if (!achievement) {
    if (!isOwn) {
      return (
        <div
          aria-hidden
          className="animate-slide-in-bottom flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02]"
          style={{ animationDelay: `${animationDelay}ms` }}
        />
      );
    }
    return (
      <Link
        href={routes.profile.achievements}
        aria-label={t('pin')}
        className="animate-slide-in-bottom flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] transition-colors hover:border-white/30 hover:bg-white/[0.04] active:scale-95"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <Plus size={20} className="text-white/35" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      className="animate-slide-in-bottom flex aspect-square w-full items-center justify-center p-2 transition-transform active:scale-95"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <Achievement
        achievement={achievement}
        size="lg"
        className="!h-full !w-full"
        classNames={{ icon: '!w-full !h-full' }}
      />
    </button>
  );
}
