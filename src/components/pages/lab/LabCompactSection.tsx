'use client';

import {
  TaskCategory,
  TaskFrequency,
  TaskRarity,
  TaskRewardType,
  TaskStatus,
} from '@/types/enums/tasks.enums';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { LabCompactCard, type LabCompactVariant } from './LabCompactCard';
import { LabSection } from './LabSection';
import { LabVariant } from './LabVariant';

/**
 * Five one-time tasks with the titles that actually get cut on the live screen,
 * plus the states a compact row can be in: to do, ready to claim, done, locked.
 */
const TASKS: Task[] = [
  {
    id: 'c1',
    category: TaskCategory.SOCIAL,
    frequency: TaskFrequency.ONCE,
    status: TaskStatus.COMPLETED,
    rarity: TaskRarity.SILVER,
    title: 'Follow our Telegram channel',
    rewards: [
      { type: TaskRewardType.LC, amount: 100 },
      { type: TaskRewardType.ACTIVITY_POINTS, amount: 50 },
    ],
    progress: { current: 1, target: 1 },
    externalLink: 'https://t.me/luckyticket365',
  },
  {
    id: 'c2',
    category: TaskCategory.SOCIAL,
    frequency: TaskFrequency.ONCE,
    status: TaskStatus.IN_PROGRESS,
    rarity: TaskRarity.SILVER,
    title: 'Subscribe on Twitter / X',
    rewards: [
      { type: TaskRewardType.LC, amount: 100 },
      { type: TaskRewardType.ACTIVITY_POINTS, amount: 50 },
    ],
    progress: { current: 0, target: 1 },
    externalLink: 'https://x.com/luckyticket365',
  },
  {
    id: 'c3',
    category: TaskCategory.SOCIAL,
    frequency: TaskFrequency.ONCE,
    status: TaskStatus.READY_TO_CLAIM,
    rarity: TaskRarity.SILVER,
    title: 'Subscribe to YouTube and watch the launch video',
    rewards: [
      { type: TaskRewardType.LC, amount: 200 },
      { type: TaskRewardType.ACTIVITY_POINTS, amount: 75 },
    ],
    progress: { current: 1, target: 1 },
    externalLink: 'https://youtube.com/@luckyticket365',
  },
  {
    id: 'c4',
    category: TaskCategory.ACHIEVEMENTS,
    frequency: TaskFrequency.ONCE,
    status: TaskStatus.IN_PROGRESS,
    rarity: TaskRarity.GOLD,
    title: 'Win a prize place in ten different tournaments',
    subtitle: 'Any tier counts.',
    rewards: [
      { type: TaskRewardType.LC, amount: 1000 },
      { type: TaskRewardType.TICKETS, amount: 1 },
      { type: TaskRewardType.ACTIVITY_POINTS, amount: 15 },
    ],
    progress: { current: 3, target: 10 },
  },
  {
    id: 'c5',
    category: TaskCategory.PROFILE_STATUS,
    frequency: TaskFrequency.ONCE,
    status: TaskStatus.LOCKED,
    rarity: TaskRarity.PLATINUM,
    title: 'Reach the Diamond status',
    unlockHint: 'Available from Platinum.',
    rewards: [{ type: TaskRewardType.ACTIVITY_POINTS, amount: 40 }],
    progress: { current: 0, target: 1 },
  },
];

const VARIANTS: { key: LabCompactVariant; label: string; bet: string }[] = [
  {
    key: 'current',
    label: '0 · как сейчас',
    bet: 'Заголовок зажат между иконкой и чипами наград — поэтому «Follow our Telegra…», «Subscribe on Twitte…», «Subscribe to YouTu…».',
  },
  {
    key: 'headline',
    label: 'К1 · награды под заголовком',
    bet: 'Чипы уезжают на вторую строку, заголовку достаётся вся ширина. Высота та же — 60px.',
  },
  {
    key: 'stacked',
    label: 'К2 · заголовок в две строки, награды справа',
    bet: 'Длинное название переносится, награды столбиком справа. Растёт только та строка, которой не хватило места.',
  },
  {
    key: 'lit',
    label: 'К3 · К1 плюс свет категории',
    bet: 'То же, что К1, но рамка редкости заменена волосяной и светом по категории — тот же язык, что у больших карточек после переделки.',
  },
];

const noop = () => {};

export function LabCompactSection() {
  return (
    <LabSection
      title="Компактные строки — одноразовые задания"
      note="Соцсети, достижения, профиль. Их сотни, поэтому высокую карточку сюда не поставить — вопрос в том, что можно починить, оставшись коротким. Всё нажимается: «забрать» помечает выполненным, внешние ссылки открываются."
    >
      {VARIANTS.map(v => (
        <LabVariant key={v.key} label={v.label} bet={v.bet}>
          <div className="flex flex-col gap-2">
            {TASKS.map(task => (
              <LabCompactCard key={task.id} task={task} variant={v.key} onClaim={noop} />
            ))}
          </div>
        </LabVariant>
      ))}
    </LabSection>
  );
}
