'use client';
import { useRef } from 'react';
import { ChevronRight, Plus, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { Achievement } from '@/components/shared/achievements/Achievement';
import { AchievementAddSlot } from '@/components/shared/achievements/AchievementAddSlot';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants, calcShowcaseSlotPrice } from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import { rarityLabelKey } from '@/components/shared/achievements/achievement.utils';
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
  onBuySlot?: () => void;
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
  onBuySlot,
  className,
}: AchievementShowcaseProps) {
  const t = useAppTranslations();
  const slotByIndex = new Map<number, AchievementType>();
  pinnedAchievements.forEach(a => {
    if (a.pinnedSlot != null) slotByIndex.set(a.pinnedSlot, a);
  });

  const featured = slotByIndex.get(0) ?? null;
  const sideSlots = Array.from({ length: Math.max(0, showcaseSlots - 1) }).map(
    (_, i) => slotByIndex.get(i + 1) ?? null
  );
  const canAddMore = showcaseSlots < showcaseMaxSlots;
  const nextSlotPrice = canAddMore ? calcShowcaseSlotPrice(showcaseSlots) : 0;

  return (
    <section className={twMerge('flex flex-col gap-3', className)}>
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-base font-extrabold text-white">{t('showcase')}</h3>
          <span className="text-[11px] text-white/50">
            {pinnedAchievements.length} / {showcaseSlots} {t('pinned')}
          </span>
        </div>
        <Link
          href={routes.profile.achievements}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-electric-pink"
        >
          {t('view all')} ({totalEarned}/{totalAchievements})
          <ChevronRight size={12} />
        </Link>
      </header>

      <div className="grid grid-cols-5 gap-2.5">
        <FeaturedSlot
          achievement={featured}
          isOwn={isOwn}
          onTap={() => onTapSlot?.(0, featured)}
          onLongPress={() => onLongPressSlot?.(0, featured)}
        />

        <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-2">
          {sideSlots.slice(0, 4).map((ach, i) => (
            <ShowcaseSlot
              key={i}
              achievement={ach}
              isOwn={isOwn}
              onTap={() => onTapSlot?.(i + 1, ach)}
              onLongPress={() => onLongPressSlot?.(i + 1, ach)}
              animationDelay={(i + 1) * 60}
            />
          ))}
        </div>
      </div>

      {sideSlots.length > 4 && (
        <div className="-mx-5 px-5 overflow-x-auto scrollbar-hidden">
          <div className="flex w-max gap-2 pr-3">
            {sideSlots.slice(4).map((ach, i) => (
              <div key={i} className="flex-shrink-0">
                <ShowcaseSlot
                  achievement={ach}
                  isOwn={isOwn}
                  onTap={() => onTapSlot?.(i + 5, ach)}
                  onLongPress={() => onLongPressSlot?.(i + 5, ach)}
                  animationDelay={(i + 5) * 60}
                />
              </div>
            ))}
            {isOwn && canAddMore && (
              <div
                className="flex-shrink-0 animate-slide-in-bottom"
                style={{ animationDelay: `${showcaseSlots * 60}ms` }}
              >
                <AchievementAddSlot costLs={nextSlotPrice} onClick={onBuySlot} />
              </div>
            )}
          </div>
        </div>
      )}

      {sideSlots.length <= 4 && isOwn && canAddMore && (
        <div className="flex justify-end">
          <AchievementAddSlot costLs={nextSlotPrice} onClick={onBuySlot} size={56} />
        </div>
      )}

      {isOwn && !canAddMore && (
        <p className="text-center text-[11px] text-white/45">
          {t('all showcase slots unlocked', { max: GlobalConstants.showcaseMaxSlots })}
        </p>
      )}
    </section>
  );
}

interface FeaturedSlotProps {
  achievement: AchievementType | null;
  isOwn: boolean;
  onTap: () => void;
  onLongPress: () => void;
}

function FeaturedSlot({ achievement, isOwn, onTap, onLongPress }: FeaturedSlotProps) {
  const t = useAppTranslations();
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressedLongRef = useRef(false);

  const startPress = () => {
    pressedLongRef.current = false;
    if (isOwn) {
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
    return (
      <button
        type="button"
        onClick={isOwn ? onTap : undefined}
        disabled={!isOwn}
        className="featured-slot col-span-3 flex aspect-square flex-col items-center justify-center gap-2 transition-all active:scale-95"
      >
        {isOwn ? (
          <>
            <Sparkles size={28} className="text-gold" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/65">
              {t('pin first badge')}
            </span>
          </>
        ) : (
          <span className="text-xs uppercase tracking-wider text-white/25">—</span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      className="featured-slot col-span-3 flex aspect-square flex-col items-center justify-center gap-2 p-3 transition-all active:scale-95"
    >
      <Achievement achievement={achievement} size="lg" />
      <div className="flex flex-col items-center gap-0.5 w-full">
        <span className="line-clamp-1 w-full text-center text-sm font-extrabold text-white">
          {achievement.name}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-electric-pink font-bold">
          {t(rarityLabelKey(achievement.rarity))}
        </span>
      </div>
    </button>
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
    if (isOwn) {
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
    return (
      <button
        type="button"
        onClick={isOwn ? onTap : undefined}
        disabled={!isOwn}
        aria-label={isOwn ? t('pin') : ''}
        className="animate-slide-in-bottom flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02]"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {isOwn && <Plus size={16} className="text-white/35" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      className="animate-slide-in-bottom flex aspect-square w-full items-center justify-center"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <Achievement achievement={achievement} size="sm" className="!h-full !w-full" />
    </button>
  );
}
