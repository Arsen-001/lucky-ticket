'use client';

import { twMerge } from 'tailwind-merge';
import { Trophy } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { TaskCategory, TaskStatus } from '@/types/enums/tasks.enums';
import type { Quest, QuestStep } from '@/types/interfaces/tasks.interfaces';
import { TaskCategoryIcon } from './TaskCategoryIcon';
import { TaskRewardRow } from './TaskRewardRow';
import { QuestStepNode } from './QuestStepNode';
import { SectionShine } from './SectionShine';

export interface QuestSectionProps {
  quest: Quest | null;
  onClaimStep: (step: QuestStep) => void;
  registerSection?: (category: TaskCategory, el: HTMLElement | null) => void;
  className?: string;
  highlightToken?: number | null;
}

export function QuestSection({
  quest,
  onClaimStep,
  registerSection,
  className,
  highlightToken,
}: QuestSectionProps) {
  const t = useAppTranslations();
  const { leftTimeText, expired } = useCountDown(quest?.expiresAt);

  if (!quest) return null;

  const completedSteps = quest.steps.filter(s => s.status === TaskStatus.COMPLETED).length;
  const totalSteps = quest.steps.length;

  return (
    <section
      ref={el => registerSection?.(TaskCategory.QUEST, el)}
      data-category={TaskCategory.QUEST}
      className={twMerge('flex flex-col gap-3 px-4 pt-5 pb-1 scroll-mt-20', className)}
    >
      <header className="relative flex items-center gap-3 rounded-2xl overflow-hidden">
        <SectionShine token={highlightToken ?? null} />
        <TaskCategoryIcon category={TaskCategory.QUEST} size={20} />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-extrabold leading-tight">{quest.title}</h2>
          <p className="text-[11px] text-pink-secondary line-clamp-1">{quest.subtitle}</p>
        </div>
        {quest.expiresAt && !expired && (
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/60">
            {leftTimeText}
          </span>
        )}
      </header>

      <div className="rounded-2xl task-card-rarity-legendary px-3 py-3 flex items-center gap-3 bg-background-overlay">
        <div className="flex-center w-12 h-12 rounded-2xl bg-gradient-to-br from-gold to-electric-pink shrink-0">
          <Trophy size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            {t('quest final reward')}
          </p>
          <p className="text-sm text-white/70">
            {t('quest progress', { completed: completedSteps, total: totalSteps })}
          </p>
          <TaskRewardRow rewards={quest.finalReward} size="sm" className="mt-1" />
        </div>
      </div>

      <div className="pt-2">
        {quest.steps.map((step, i) => (
          <QuestStepNode
            key={step.id}
            step={step}
            index={i}
            isLast={i === quest.steps.length - 1}
            onClaim={onClaimStep}
          />
        ))}
      </div>
    </section>
  );
}
