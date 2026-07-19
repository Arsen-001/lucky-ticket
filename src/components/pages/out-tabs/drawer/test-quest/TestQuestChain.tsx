'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Clock3, Crown, FlaskConical, Gift, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/shared/buttons/Button';
import { useClaimTestQuestLevelMutation, useGetTestQuestQuery } from '@/api/testQuest.api';
import { TEST_QUEST_START_LEVEL, testQuestLadder } from '@/constants/testQuest.constants';
import { TestQuestLeaderboard } from './TestQuestLeaderboard';
import { TestQuestBadge } from './TestQuestBadge';

type LevelKind = 'claimed' | 'ready' | 'waiting' | 'locked' | 'crown';

const SLIDE_WIDTH = 176;

// The ladder is a static constant, so its display order (31 → 1) never changes.
// Sort once at module load instead of re-sorting on every render.
const LEVELS = [...testQuestLadder].sort((a, b) => b.level - a.level);

export interface TestQuestChainProps {
  className?: string;
}

/**
 * "Тест-квест" milestone chain — the launch quest as a horizontal card chain
 * (31 → 1), the core of the dedicated Test-Quest screen. Levels 31 → 4 are the
 * daily ladder (one claim per day); levels 3 → 1 are the competitive crown
 * (rendered below, leaderboard-assigned).
 *
 * Uses the same snap-focus carousel UX as {@link TournamentMilestoneSlider} and
 * the daily ads slider: the leftmost-visible card is the "active" one, rendered
 * at full scale/opacity while its neighbours shrink, dim, and pull inward. Tap a
 * side card to bring it into focus; the current daily level auto-focuses on mount.
 */
export function TestQuestChain({ className }: TestQuestChainProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const { data } = useGetTestQuestQuery();
  const [claim, { isLoading: claiming }] = useClaimTestQuestLevelMutation();

  const currentLevel = data?.level ?? TEST_QUEST_START_LEVEL; // daily current (31 → 4)
  const claimableToday = data?.claimableToday ?? true;
  const crownLevel = data?.crownLevel ?? null;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Left-anchored active tracking — the leftmost-visible card is the active one
  // (mirrors TournamentMilestoneSlider so both chains feel identical).
  const recomputeActive = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const probe = scroller.scrollLeft + 16; // small offset from the left edge
    const slides = scroller.querySelectorAll<HTMLDivElement>('[data-tq-slide]');
    let bestIdx = 0;
    let bestDist = Infinity;
    slides.forEach(el => {
      const idx = Number(el.dataset.tqIndex);
      const dist = Math.abs(el.offsetLeft - probe);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });
    setActiveIndex(bestIdx);
  }, []);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const el = scroller.querySelector<HTMLDivElement>(`[data-tq-index="${index}"]`);
    if (!el) return;
    // Align the card to the LEFT edge — scroll the slider only, never
    // scrollIntoView (which would tug the Tasks page's vertical scroller).
    scroller.scrollTo({ left: Math.max(0, el.offsetLeft - 16), behavior });
  }, []);

  useEffect(() => {
    recomputeActive();
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.addEventListener('scroll', recomputeActive, { passive: true });
    window.addEventListener('resize', recomputeActive);
    return () => {
      scroller.removeEventListener('scroll', recomputeActive);
      window.removeEventListener('resize', recomputeActive);
    };
  }, [recomputeActive]);

  // Auto-focus the current daily level on mount / when it advances.
  const currentIndex = LEVELS.findIndex(l => l.level === currentLevel);
  useEffect(() => {
    if (currentIndex < 0) return;
    const id = window.setTimeout(() => scrollToIndex(currentIndex, 'smooth'), 50);
    return () => window.clearTimeout(id);
  }, [currentIndex, scrollToIndex]);

  const kindOf = (level: number, zone: string): LevelKind => {
    if (zone === 'crown') return 'crown';
    if (level > currentLevel) return 'claimed';
    if (level === currentLevel) return claimableToday ? 'ready' : 'waiting';
    return 'locked';
  };

  const handleClaim = async () => {
    if (!claimableToday || claiming) return;
    try {
      await claim().unwrap();
    } catch {
      toast.error(t('claim failed'));
    }
  };

  return (
    <section className={twMerge('flex flex-col gap-2 px-4 pt-4', className)}>
      <div className="flex items-center gap-2">
        <div className="flex-center h-7 w-7 rounded-lg bg-gradient-to-br from-electric-pink to-electric-purple shadow-md shadow-black/30">
          <FlaskConical size={14} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold leading-tight">{t('test quest chain title')}</h3>
          <p className="line-clamp-1 text-[11px] text-pink-secondary">
            {t('test quest chain blurb')}
          </p>
        </div>
        {data?.frozen && data.badgeLevel != null && (
          <TestQuestBadge level={data.badgeLevel} className="shrink-0" />
        )}
      </div>

      {!data?.frozen && data && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-white-secondary">
              {t('level')} <span className="tabular-nums text-white">{data.level}</span>
            </span>
            <span className="tabular-nums text-white/80">
              {data.climbed}/{data.totalLevels}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-electric-pink to-electric-purple transition-[width] duration-500"
              style={{ width: `${data.progress}%` }}
            />
          </div>
        </div>
      )}

      {data?.frozen && (
        <div className="flex items-center gap-1.5 text-[11px] text-white-secondary">
          <Gift size={12} className="text-gold" />
          {t('monthly chest')} ·{' '}
          <span className="font-bold tabular-nums text-white">
            {data.chestsPaid}/{data.chestsTotal}
          </span>
        </div>
      )}

      <div
        ref={scrollerRef}
        className="scrollbar-hidden -mx-4 flex snap-x snap-mandatory items-center gap-[27px] overflow-x-auto overflow-y-visible px-4"
        style={{ scrollPaddingInline: '16px' }}
      >
        {LEVELS.map((level, index) => {
          const kind = kindOf(level.level, level.zone);
          const isCrown = kind === 'crown';
          const isMyCrown = isCrown && crownLevel === level.level;
          const isActive = index === activeIndex;
          // Left-anchored: active card stays put, side cards pull toward it.
          const sideOffset = isActive ? 0 : index < activeIndex ? 20 : -20;
          return (
            <div
              key={level.level}
              data-tq-slide
              data-tq-index={index}
              onClick={!isActive ? () => scrollToIndex(index) : undefined}
              style={{
                flex: `0 0 ${SLIDE_WIDTH}px`,
                transform: `translateX(${sideOffset}px) scale(${isActive ? 1 : 0.88})`,
                transformOrigin: 'left center',
              }}
              className={twMerge(
                'snap-start transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                isActive ? 'opacity-100' : 'cursor-pointer opacity-65 saturate-75'
              )}
            >
              <div
                className={twMerge(
                  'flex h-full min-h-[200px] flex-col gap-2 rounded-2xl border bg-background-overlay p-3',
                  kind === 'ready' && 'border-electric-pink/50 shadow-lg shadow-electric-purple/15',
                  kind === 'waiting' && 'border-white/10',
                  kind === 'claimed' && 'border-success/25 opacity-80',
                  kind === 'locked' && 'border-white/5 opacity-55 saturate-50',
                  isCrown && 'border-gold/40 bg-gradient-to-b from-gold/10 to-transparent',
                  isMyCrown && 'border-gold/70 shadow-lg shadow-gold/20'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className={twMerge(
                        'text-[10px] font-bold uppercase tracking-[0.14em]',
                        isCrown ? 'text-gold/80' : 'text-white/50'
                      )}
                    >
                      {isCrown ? t('crown') : t('level')}
                    </div>
                    <div
                      className={twMerge(
                        'bg-clip-text text-4xl font-extrabold leading-none tabular-nums text-transparent',
                        isCrown
                          ? 'bg-gradient-to-br from-warning to-gold'
                          : 'bg-gradient-to-br from-electric-pink to-electric-purple'
                      )}
                    >
                      {level.level}
                    </div>
                  </div>
                  {kind === 'claimed' ? (
                    <span className="flex-center h-6 w-6 shrink-0 rounded-full bg-success/20">
                      <Check size={12} className="text-success" />
                    </span>
                  ) : kind === 'locked' ? (
                    <span className="flex-center h-6 w-6 shrink-0 rounded-full bg-white/5">
                      <Lock size={12} className="text-white/40" />
                    </span>
                  ) : kind === 'waiting' ? (
                    <span className="flex-center h-6 w-6 shrink-0 rounded-full bg-white/5">
                      <Clock3 size={12} className="text-white/50" />
                    </span>
                  ) : isCrown ? (
                    <span
                      className={twMerge(
                        'flex-center h-6 w-6 shrink-0 rounded-full',
                        isMyCrown ? 'bg-gold/25' : 'bg-white/5'
                      )}
                    >
                      <Crown size={12} className={isMyCrown ? 'text-gold' : 'text-white/40'} />
                    </span>
                  ) : null}
                </div>

                <p className="my-auto line-clamp-2 text-[12px] font-semibold leading-snug text-white/80">
                  {level.task}
                </p>
                <p className="line-clamp-2 text-[10px] leading-tight text-white-secondary tabular-nums">
                  {level.drop}
                </p>

                {kind === 'ready' && (
                  <Button
                    className="flex-center w-full gap-1 rounded-xl py-2 text-xs font-bold animate-task-pulse"
                    loading={claiming}
                    onClick={e => {
                      e.stopPropagation();
                      handleClaim();
                    }}
                  >
                    <Gift size={12} />
                    {t('claim')}
                  </Button>
                )}
                {kind === 'waiting' && (
                  <div className="flex-center w-full gap-1 rounded-xl bg-white/5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
                    <Clock3 size={11} />
                    {t('come back tomorrow')}
                  </div>
                )}
                {kind === 'claimed' && (
                  <div className="flex-center w-full gap-1 rounded-xl bg-success/15 py-1.5 text-[10px] font-bold uppercase tracking-wider text-success">
                    <Check size={11} />
                    {t('claimed')}
                  </div>
                )}
                {kind === 'locked' && (
                  <div className="flex-center w-full gap-1 rounded-xl bg-white/5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
                    <Lock size={11} />
                    {t('locked')}
                  </div>
                )}
                {isCrown && (
                  <div
                    className={twMerge(
                      'flex-center w-full gap-1 rounded-xl py-1.5 text-[10px] font-bold uppercase tracking-wider',
                      isMyCrown ? 'bg-gold/20 text-gold' : 'border border-gold/30 text-gold/80'
                    )}
                  >
                    <Crown size={11} />
                    {isMyCrown ? t('your crown') : t('by leaderboard')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TestQuestLeaderboard />
    </section>
  );
}
