'use client';

import { useEffect, useRef } from 'react';
import { Check, Clock3, Crown, FlaskConical, Gift, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/shared/buttons/Button';
import { TaskCategory } from '@/types/enums/tasks.enums';
import { useClaimTestQuestLevelMutation, useGetTestQuestQuery } from '@/api/testQuest.api';
import { TEST_QUEST_START_LEVEL, testQuestLadder } from '@/constants/testQuest.constants';
import { TestQuestLeaderboard } from './TestQuestLeaderboard';
import { TestQuestBadge } from './TestQuestBadge';

type LevelKind = 'claimed' | 'ready' | 'waiting' | 'locked' | 'crown';

export interface TestQuestChainProps {
  registerSection?: (category: TaskCategory, el: HTMLElement | null) => void;
  className?: string;
}

/**
 * "Тест-квест" milestone chain — the launch quest as a horizontal card chain
 * (31 → 1), first category in the One-Time tab. Levels 31 → 4 are the daily
 * ladder (one claim per day); levels 3 → 1 are the competitive crown, assigned
 * by the Founders leaderboard (rendered below), never daily-claimed.
 */
export function TestQuestChain({ registerSection, className }: TestQuestChainProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const { data } = useGetTestQuestQuery();
  const [claim, { isLoading: claiming }] = useClaimTestQuestLevelMutation();

  const currentLevel = data?.level ?? TEST_QUEST_START_LEVEL; // daily current (31 → 4)
  const claimableToday = data?.claimableToday ?? true;
  const crownLevel = data?.crownLevel ?? null;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      currentRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
    }, 60);
    return () => window.clearTimeout(id);
  }, [currentLevel]);

  const levels = [...testQuestLadder].sort((a, b) => b.level - a.level); // 31 → 1

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
    <section
      ref={el => registerSection?.(TaskCategory.TEST_QUEST, el)}
      className={twMerge('flex flex-col gap-2 px-4 pt-4', className)}
    >
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
        className="scrollbar-hidden -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-1"
      >
        {levels.map(level => {
          const kind = kindOf(level.level, level.zone);
          const isCurrent = kind === 'ready' || kind === 'waiting';
          const isCrown = kind === 'crown';
          const isMyCrown = isCrown && crownLevel === level.level;
          return (
            <div
              key={level.level}
              ref={isCurrent ? currentRef : undefined}
              className={twMerge(
                'flex w-[168px] shrink-0 snap-start flex-col gap-2 rounded-2xl border bg-background-overlay p-3',
                'min-h-[200px] transition-all',
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
                  onClick={handleClaim}
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
          );
        })}
      </div>

      <TestQuestLeaderboard />
    </section>
  );
}
