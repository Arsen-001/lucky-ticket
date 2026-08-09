'use client';

import { useState } from 'react';
import {
  TaskCategory,
  TaskFrequency,
  TaskRarity,
  TaskRewardType,
  TaskStatus,
} from '@/types/enums/tasks.enums';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { LabSection } from './LabSection';
import { LabTaskCardFull } from './LabTaskCardFull';
import { LabVariant } from './LabVariant';

/** Twelve hours out, so the reset countdown is a real, ticking value. */
const RESET_AT = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

/**
 * Five tasks chosen to exercise everything a task card can do, not just the
 * happy one: a truncating headline, a multi-step task with a claimable step, a
 * ready-to-claim task, a locked tier task (whose tap goes to the status market)
 * and an external-link social task.
 */
const TASKS: Task[] = [
  {
    id: 'lab-1',
    category: TaskCategory.TOURNAMENTS,
    frequency: TaskFrequency.DAILY,
    status: TaskStatus.IN_PROGRESS,
    rarity: TaskRarity.GOLD,
    title: 'Join a Gold tournament with 1 ticket',
    subtitle: 'The entry itself counts — no need to wait for the draw.',
    rewards: [
      { type: TaskRewardType.LC, amount: 200 },
      { type: TaskRewardType.ACTIVITY_POINTS, amount: 3 },
    ],
    progress: { current: 0, target: 1 },
    tier: 'gold',
    resetAt: RESET_AT,
  },
  {
    id: 'lab-2',
    category: TaskCategory.TOURNAMENTS,
    frequency: TaskFrequency.DAILY,
    status: TaskStatus.IN_PROGRESS,
    rarity: TaskRarity.GOLD,
    title: 'Complete all available tournament tasks',
    subtitle: 'Finish every unlocked tier task today.',
    rewards: [
      { type: TaskRewardType.LC, amount: 600 },
      { type: TaskRewardType.TICKETS, amount: 1 },
      { type: TaskRewardType.ACTIVITY_POINTS, amount: 1 },
    ],
    progress: { current: 5, target: 8 },
    tier: 'gold',
    resetAt: RESET_AT,
    subSteps: [
      { id: 's1', label: 'Bronze', completed: true, claimed: true },
      {
        id: 's2',
        label: 'Silver',
        completed: true,
        reward: { type: TaskRewardType.LC, amount: 50 },
      },
      {
        id: 's3',
        label: 'Gold',
        completed: true,
        reward: { type: TaskRewardType.LC, amount: 80 },
      },
      { id: 's4', label: 'Platinum', completed: false },
    ],
  },
  {
    id: 'lab-3',
    category: TaskCategory.TOURNAMENTS,
    frequency: TaskFrequency.DAILY,
    status: TaskStatus.READY_TO_CLAIM,
    rarity: TaskRarity.BRONZE,
    title: 'Join 4 Bronze tournaments',
    subtitle: 'All 4 daily Bronze brackets — easy AP.',
    rewards: [
      { type: TaskRewardType.LC, amount: 100 },
      { type: TaskRewardType.ACTIVITY_POINTS, amount: 1 },
    ],
    progress: { current: 4, target: 4 },
    tier: 'bronze',
    resetAt: RESET_AT,
  },
  {
    id: 'lab-4',
    category: TaskCategory.TOURNAMENTS,
    frequency: TaskFrequency.DAILY,
    status: TaskStatus.LOCKED,
    rarity: TaskRarity.PLATINUM,
    title: 'Join a Diamond tournament with 1 ticket',
    subtitle: 'The entry itself counts — no need to wait for the draw.',
    unlockHint: 'Reach Diamond tier to unlock.',
    rewards: [
      { type: TaskRewardType.LC, amount: 800 },
      { type: TaskRewardType.TICKETS, amount: 1 },
      { type: TaskRewardType.ACTIVITY_POINTS, amount: 5 },
    ],
    progress: { current: 0, target: 1 },
    tier: 'diamond',
  },
  {
    id: 'lab-5',
    category: TaskCategory.SOCIAL,
    frequency: TaskFrequency.ONCE,
    status: TaskStatus.IN_PROGRESS,
    rarity: TaskRarity.SILVER,
    title: 'Subscribe to the LuckyTicket365 channel',
    subtitle: 'Announcements, results and promo codes.',
    rewards: [
      { type: TaskRewardType.LC, amount: 150 },
      { type: TaskRewardType.ACTIVITY_POINTS, amount: 2 },
    ],
    progress: { current: 0, target: 1 },
    externalLink: 'https://t.me/luckyticket365',
  },
];

const noop = () => {};

export function LabTasksSection() {
  const [pinned, setPinned] = useState<Record<string, boolean>>({ 'lab-1': true });
  const togglePin = (id: string) => setPinned(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <LabSection
      title="Карточка задания — в форме карточки турнира"
      note="Пять заданий, задевающих все ветки: длинный заголовок, задание с подшагами (кнопка раскрывает список, розовая точка = внутри есть что забрать), готовое к получению, заблокированное алмазное и социальное со внешней ссылкой. Всё нажимается — поведение то же, что на проде. Сравнить со старым видом можно на /tasks."
    >
      <LabVariant label="T · один в один с карточкой турнира">
        <div className="flex flex-col gap-2">
          {TASKS.map(task => (
            <LabTaskCardFull
              key={task.id}
              task={task}
              onClaim={noop}
              onClaimSubStep={noop}
              pinned={!!pinned[task.id]}
              onTogglePin={togglePin}
            />
          ))}
        </div>
      </LabVariant>
    </LabSection>
  );
}
