import { routes, type Route } from '@/constants/routes';

/**
 * Test-Quest ladder — the 31-day launch quest ("Тестировщик 31 → 1").
 *
 * PROTOTYPE DATA. These per-level task/drop strings are front-end placeholder
 * content so the pinned card can be seen and clicked in the running app. When
 * the backend ships the `test-quest` endpoint the card switches to live data
 * (already-localized by the server) and this constant is retired.
 *
 * Countdown mechanic (see the launch design): every player enters at level 31
 * and climbs toward level 1 (1 = the top). Levels 31→4 are the daily ladder;
 * levels 3→1 are the competitive crown (leaderboard-assigned at test end).
 */

export type TestQuestZone = 'entry' | 'ladder' | 'wall' | 'crown';

export interface TestQuestLevel {
  /** Badge level. 31 = entry, 1 = top crown. */
  level: number;
  /** Day of the test the level maps to (null for entry / crown). */
  day: number | null;
  /** The level's own task (placeholder content until the backend owns it). */
  task: string;
  /** Reward that drops when the level is taken. */
  drop: string;
  zone: TestQuestZone;
}

export const TEST_QUEST_TOTAL_LEVELS = 31;

/** Demo: the level the pinned card starts on in the running app. */
export const TEST_QUEST_START_LEVEL = 31;

/** Official channel the Test-Quest gate checks membership of. */
export const TEST_QUEST_CHANNEL_HANDLE = '@luckyticket365';
export const TEST_QUEST_CHANNEL_URL = 'https://t.me/luckyticket365';

/** Full ladder, level 31 (entry) down to level 1 (top crown). */
export const testQuestLadder: TestQuestLevel[] = [
  {
    level: 31,
    day: null,
    task: 'Старт',
    drop: '5k LC · 1 LS',
    zone: 'entry',
  },
  {
    level: 30,
    day: 1,
    task: 'Раскачай движок',
    drop: '10k LC · 2 LS',
    zone: 'ladder',
  },
  {
    level: 29,
    day: 2,
    task: 'Трата и апгрейд',
    drop: '10k LC · 2 LS',
    zone: 'ladder',
  },
  {
    level: 28,
    day: 3,
    task: 'Движок и профиль',
    drop: '10k LC · 2 LS',
    zone: 'ladder',
  },
  {
    level: 27,
    day: 4,
    task: 'Апгрейд движка',
    drop: '10k LC · 2 LS',
    zone: 'ladder',
  },
  {
    level: 26,
    day: 5,
    task: 'Первый реферал',
    drop: '25k LC · 1 билет · 5 LS · LP 2д',
    zone: 'wall',
  },
  {
    level: 25,
    day: 6,
    task: 'Прокачай движок',
    drop: '10k LC · 2 LS',
    zone: 'ladder',
  },
  { level: 24, day: 7, task: 'Кошелёк и звёзды', drop: '10k LC · 2 LS', zone: 'ladder' },
  {
    level: 23,
    day: 8,
    task: 'Купи осколок',
    drop: '10k LC · 2 LS',
    zone: 'ladder',
  },
  {
    level: 22,
    day: 9,
    task: 'Держи темп',
    drop: '15k LC · 3 LS',
    zone: 'ladder',
  },
  {
    level: 21,
    day: 10,
    task: 'Первый стейк',
    drop: '15k LC · 3 LS',
    zone: 'ladder',
  },
  {
    level: 20,
    day: 11,
    task: 'Достигни Silver',
    drop: '30k LC · 1 билет · 6 LS · LP 3д',
    zone: 'wall',
  },
  {
    level: 19,
    day: 12,
    task: 'Набирай обороты',
    drop: '35k LC · 1 билет · 7 LS',
    zone: 'wall',
  },
  {
    level: 18,
    day: 13,
    task: 'Гонка за друзьями',
    drop: '15k LC · 1 билет · 3 LS',
    zone: 'ladder',
  },
  {
    level: 17,
    day: 14,
    task: 'Копи рефералов',
    drop: '15k LC · 1 билет · 3 LS',
    zone: 'ladder',
  },
  {
    level: 16,
    day: 15,
    task: 'Купи осколок',
    drop: '40k LC · 1 билет · 8 LS · LP 4д',
    zone: 'wall',
  },
  { level: 15, day: 16, task: 'Достигни Gold', drop: '40k LC · 1 билет · 8 LS', zone: 'wall' },
  {
    level: 14,
    day: 17,
    task: 'Держи темп',
    drop: '20k LC · 1 билет · 4 LS',
    zone: 'ladder',
  },
  {
    level: 13,
    day: 18,
    task: 'Набирай обороты',
    drop: '20k LC · 1 билет · 4 LS',
    zone: 'ladder',
  },
  {
    level: 12,
    day: 19,
    task: 'Новый движок',
    drop: '45k LC · 1 билет · 9 LS · 1 движок',
    zone: 'wall',
  },
  {
    level: 11,
    day: 20,
    task: '2 активных стейка',
    drop: '20k LC · 1 билет · 4 LS',
    zone: 'ladder',
  },
  {
    level: 10,
    day: 21,
    task: 'Гонка за друзьями',
    drop: '45k LC · 1 билет · 9 LS · LP 5д',
    zone: 'wall',
  },
  {
    level: 9,
    day: 22,
    task: 'Держи Gold',
    drop: '20k LC · 1 билет · 4 LS',
    zone: 'ladder',
  },
  {
    level: 8,
    day: 23,
    task: 'Купи движок',
    drop: '20k LC · 1 билет · 4 LS',
    zone: 'ladder',
  },
  {
    level: 7,
    day: 24,
    task: 'Копи рефералов',
    drop: '50k LC · 2 билета · 10 LS',
    zone: 'wall',
  },
  {
    level: 6,
    day: 25,
    task: 'Ещё движок',
    drop: '25k LC · 1 билет · 5 LS',
    zone: 'ladder',
  },
  {
    level: 5,
    day: 26,
    task: 'Финишная прямая',
    drop: '55k LC · 2 билета · 11 LS',
    zone: 'wall',
  },
  {
    level: 4,
    day: 27,
    task: 'Platinum · квалификация',
    drop: '55k LC · 2 билета · 11 LS · LP 6д',
    zone: 'wall',
  },
  {
    level: 3,
    day: null,
    task: 'Корона · топ-50',
    drop: '105k LC · 3 билета · 21 LS',
    zone: 'crown',
  },
  {
    level: 2,
    day: null,
    task: 'Корона · топ-10',
    drop: '105k LC · 3 билета · 21 LS · VIP 1',
    zone: 'crown',
  },
  {
    level: 1,
    day: null,
    task: 'Корона · #1',
    drop: '110k LC · 3 билета · 22 LS · VIP 3 · именная печать',
    zone: 'crown',
  },
];

// Level → zone lookup. Walls and the crown are structural (fixed by the ladder
// design, not admin-editable), so a level's zone is safe to derive even for the
// server-driven ladder, whose entries omit it.
const ZONE_BY_LEVEL: ReadonlyMap<number, TestQuestZone> = new Map(
  testQuestLadder.map(l => [l.level, l.zone])
);

/** The design-fixed zone (entry / ladder / wall / crown) for a level. */
export const getTestQuestZone = (level: number): TestQuestZone =>
  ZONE_BY_LEVEL.get(level) ?? 'ladder';

/**
 * One actionable step toward completing a level's task, shown in the checklist
 * under the slider on the Test-Quest screen. Purely informational — no
 * navigation, so tapping a step never leaves the quest screen. A step with
 * `detail` or `subSteps` renders as an expandable how-to dropdown; a plain step
 * is a single row.
 */
export interface TestQuestStep {
  /** Short imperative line, e.g. "Посмотри 3 рекламы". */
  text: string;
  /** Optional how-to line; its presence turns the row into a dropdown. */
  detail?: string;
  /** Optional sub-checklist; its presence turns the row into a dropdown. */
  subSteps?: string[];
  /** Deep-link to the screen where the step is performed — rendered as an inline
   *  "go there" nav button. Auto-resolved from the text in {@link resolveTestQuestSteps}. */
  href?: Route;
  /** Target count for a countable step (e.g. 90 ads). Rendered as a "done / target"
   *  progress badge at the row's end; the number-less action lives in `text`. */
  target?: number;
  /** Marks the channel-subscription gate. Its done-state follows the live
   *  subscription status (not the level's claimed state), and while unsatisfied
   *  it blocks the level's reward claim. */
  gate?: 'channel';
}

// The channel-subscription gate — required on EVERY level to claim its reward.
const CHANNEL_GATE: TestQuestStep = {
  text: 'Подпишись на канал @luckyticket365',
  detail: 'Без подписки награду уровня не забрать — проверяется при получении.',
  gate: 'channel',
};

// Authored, real-only checklist per level (31 → 1). Every level carries the same
// base as level 31 — engine ticket · tournament · ads · invite/share · channel
// gate — with the quantities escalating toward level 1, plus that level's own
// special task(s) (upgrade, stake, status wall, friends milestone, AP, wallet…).
// CHANNEL_GATE is always last: no reward without a channel subscription.
// Front-end prototype until the backend owns per-step data.
const TEST_QUEST_STEP_OVERRIDES: Record<number, TestQuestStep[]> = {
  // 31 · entry
  31: [
    { text: 'Забери 1 билет с движка' },
    { text: 'Потрать 1 билет' },
    { text: 'Посмотри 1 рекламу' },
    { text: 'Поделись с друзьями' },
    CHANNEL_GATE,
  ],
  // 30 · day 1 — engine-upgrade special (LS-priced — grant the stars, never force a purchase)
  30: [
    { text: 'Потрать 6 билетов' },
    { text: 'Посмотри 2 рекламы' },
    { text: 'Поделись с друзьями 2 раза' },
    { text: 'Апгрейдни движок 1 раз' },
    CHANNEL_GATE,
  ],
  // 29 · day 2 — 30's set, escalated. All targets are cumulative over the whole test.
  29: [
    { text: 'Потрать 11 билетов' },
    { text: 'Посмотри 5 реклам' },
    { text: 'Поделись с друзьями 3 раза' },
    { text: 'Купи билет в магазине' },
    { text: 'Апгрейдни движок 2 раза' },
    CHANNEL_GATE,
  ],
  // 28 · day 3 — engine-capacity upgrade + profile
  28: [
    { text: 'Потрать 16 билетов' },
    { text: 'Посмотри 10 реклам' },
    { text: 'Поделись с друзьями 5 раз' },
    { text: 'Заведи 1 реферала' },
    { text: 'Апгрейдни движок 3 раза' },
    { text: 'Оформи профиль — аватар и никнейм' },
    CHANNEL_GATE,
  ],
  // 27 · day 4 — engine-speed upgrade
  27: [
    { text: 'Потрать 21 билет' },
    { text: 'Посмотри 15 реклам' },
    { text: 'Поделись с друзьями 6 раз' },
    { text: 'Апгрейдни движок 4 раза' },
    CHANNEL_GATE,
  ],
  // 26 · day 5
  26: [
    { text: 'Потрать 26 билетов' },
    { text: 'Посмотри 22 реклам' },
    { text: 'Поделись с друзьями 8 раз' },
    { text: 'Апгрейдни движок 5 раз' },
    CHANNEL_GATE,
  ],
  // 25 · day 6
  25: [
    { text: 'Потрать 31 билетов' },
    { text: 'Посмотри 29 реклам' },
    { text: 'Поделись с друзьями 9 раз' },
    { text: 'Апгрейдни движок 6 раз' },
    CHANNEL_GATE,
  ],
  // 24 · day 7 — wallet + stars
  24: [
    { text: 'Потрать 36 билетов' },
    { text: 'Посмотри 36 реклам' },
    { text: 'Поделись с друзьями 11 раз' },
    { text: 'Апгрейдни движок 7 раз' },
    { text: 'Подключи TON-кошелёк' },
    { text: 'Обменяй TON в Lucky Stars' },
    CHANNEL_GATE,
  ],
  // 23 · day 8
  23: [
    { text: 'Потрать 41 билетов' },
    { text: 'Посмотри 43 реклам' },
    { text: 'Поделись с друзьями 12 раз' },
    { text: 'Апгрейдни движок 8 раз' },
    { text: 'Купи осколок движка в магазине' },
    CHANNEL_GATE,
  ],
  // 22 · day 9
  22: [
    { text: 'Потрать 46 билетов' },
    { text: 'Посмотри 51 реклам' },
    { text: 'Поделись с друзьями 14 раз' },
    { text: 'Заведи 2 реферала' },
    { text: 'Апгрейдни движок 9 раз' },
    CHANNEL_GATE,
  ],
  // 21 · day 10 — first stake
  21: [
    { text: 'Потрать 51 билетов' },
    { text: 'Посмотри 58 реклам' },
    { text: 'Поделись с друзьями 15 раз' },
    { text: 'Апгрейдни движок 10 раз' },
    { text: 'Сделай первый стейк' },
    CHANNEL_GATE,
  ],
  // 20 · day 11 — Silver wall
  20: [
    { text: 'Потрать 56 билетов' },
    { text: 'Посмотри 65 реклам' },
    { text: 'Поделись с друзьями 17 раз' },
    { text: 'Апгрейдни движок 11 раз' },
    { text: 'Достигни статуса Silver' },
    { text: 'Купи билет своего тира в магазине' },
    CHANNEL_GATE,
  ],
  // 19 · day 12
  19: [
    { text: 'Потрать 61 билетов' },
    { text: 'Посмотри 72 реклам' },
    { text: 'Поделись с друзьями 18 раз' },
    { text: 'Апгрейдни движок 12 раз' },
    CHANNEL_GATE,
  ],
  // 18 · day 13
  18: [
    { text: 'Потрать 66 билетов' },
    { text: 'Посмотри 79 реклам' },
    { text: 'Поделись с друзьями 20 раз' },
    { text: 'Апгрейдни движок 13 раз' },
    CHANNEL_GATE,
  ],
  // 17 · day 14
  17: [
    { text: 'Потрать 71 билетов' },
    { text: 'Посмотри 86 реклам' },
    { text: 'Поделись с друзьями 21 раз' },
    { text: 'Заведи 3 реферала' },
    { text: 'Апгрейдни движок 14 раз' },
    CHANNEL_GATE,
  ],
  // 16 · day 15
  16: [
    { text: 'Потрать 76 билетов' },
    { text: 'Посмотри 93 реклам' },
    { text: 'Поделись с друзьями 23 раз' },
    { text: 'Апгрейдни движок 15 раз' },
    { text: 'Купи осколок в магазине' },
    CHANNEL_GATE,
  ],
  // 15 · day 16 — Gold wall
  15: [
    { text: 'Потрать 81 билетов' },
    { text: 'Посмотри 100 реклам' },
    { text: 'Поделись с друзьями 24 раз' },
    { text: 'Апгрейдни движок 16 раз' },
    { text: 'Достигни статуса Gold' },
    { text: 'Держи активный стейк' },
    CHANNEL_GATE,
  ],
  // 14 · day 17
  14: [
    { text: 'Потрать 86 билетов' },
    { text: 'Посмотри 108 реклам' },
    { text: 'Поделись с друзьями 26 раз' },
    { text: 'Апгрейдни движок 17 раз' },
    CHANNEL_GATE,
  ],
  // 13 · day 18
  13: [
    { text: 'Потрать 91 билетов' },
    { text: 'Посмотри 115 реклам' },
    { text: 'Поделись с друзьями 27 раз' },
    { text: 'Апгрейдни движок 18 раз' },
    CHANNEL_GATE,
  ],
  // 12 · day 19 — new engine
  12: [
    { text: 'Потрать 96 билетов' },
    { text: 'Посмотри 122 реклам' },
    { text: 'Поделись с друзьями 29 раз' },
    { text: 'Апгрейдни движок 19 раз' },
    { text: 'Запусти новый движок' },
    CHANNEL_GATE,
  ],
  // 11 · day 20 — two stakes
  11: [
    { text: 'Потрать 101 билетов' },
    { text: 'Посмотри 129 реклам' },
    { text: 'Поделись с друзьями 30 раз' },
    { text: 'Заведи 4 реферала' },
    { text: 'Апгрейдни движок 20 раз' },
    { text: 'Держи 2 активных стейка одновременно' },
    CHANNEL_GATE,
  ],
  // 10 · day 21
  10: [
    { text: 'Потрать 106 билетов' },
    { text: 'Посмотри 136 реклам' },
    { text: 'Поделись с друзьями 32 раз' },
    { text: 'Апгрейдни движок 21 раз' },
    CHANNEL_GATE,
  ],
  // 9 · day 22 — Gold
  9: [
    { text: 'Потрать 111 билетов' },
    { text: 'Посмотри 143 реклам' },
    { text: 'Поделись с друзьями 33 раз' },
    { text: 'Апгрейдни движок 22 раза' },
    { text: 'Держи статус Gold' },
    { text: 'Купи осколок Gold в магазине' },
    CHANNEL_GATE,
  ],
  // 8 · day 23
  8: [
    { text: 'Потрать 116 билетов' },
    { text: 'Посмотри 150 реклам' },
    { text: 'Поделись с друзьями 35 раз' },
    { text: 'Апгрейдни движок 23 раза' },
    { text: 'Купи движок в магазине' },
    CHANNEL_GATE,
  ],
  // 7 · day 24
  7: [
    { text: 'Потрать 121 билетов' },
    { text: 'Посмотри 157 реклам' },
    { text: 'Поделись с друзьями 36 раз' },
    { text: 'Апгрейдни движок 24 раза' },
    CHANNEL_GATE,
  ],
  // 6 · day 25 — new engine
  6: [
    { text: 'Потрать 126 билетов' },
    { text: 'Посмотри 164 реклам' },
    { text: 'Поделись с друзьями 38 раз' },
    { text: 'Апгрейдни движок 25 раз' },
    { text: 'Запусти ещё один движок' },
    CHANNEL_GATE,
  ],
  // 5 · day 26
  5: [
    { text: 'Потрать 131 билетов' },
    { text: 'Посмотри 172 реклам' },
    { text: 'Поделись с друзьями 39 раз' },
    { text: 'Заведи 5 рефералов' },
    { text: 'Апгрейдни движок 26 раз' },
    CHANNEL_GATE,
  ],
  // 4 · day 27 — Platinum + qualification
  4: [
    { text: 'Потрать 136 билетов' },
    { text: 'Посмотри 179 реклам' },
    { text: 'Поделись с друзьями 41 раз' },
    { text: 'Апгрейдни движок 27 раз' },
    { text: 'Прокачай статус до Platinum' },
    { text: 'Квалификация на корону открыта' },
    CHANNEL_GATE,
  ],
  // 3 → 1 · crown — the base still counts daily; the crown itself is the
  // competitive top (topmost climbers), decided at test end.
  3: [
    { text: 'Потрать 141 билетов' },
    { text: 'Посмотри 186 реклам' },
    { text: 'Поделись с друзьями 42 раз' },
    { text: 'Апгрейдни движок 28 раз' },
    { text: 'Войди в топ-50' },
    CHANNEL_GATE,
  ],
  2: [
    { text: 'Потрать 146 билетов' },
    { text: 'Посмотри 193 реклам' },
    { text: 'Поделись с друзьями 44 раз' },
    { text: 'Апгрейдни движок 29 раз' },
    { text: 'Войди в топ-10' },
    CHANNEL_GATE,
  ],
  1: [
    { text: 'Потрать 150 билетов' },
    { text: 'Посмотри 200 реклам' },
    { text: 'Поделись с друзьями 45 раз' },
    { text: 'Апгрейдни движок 30 раз' },
    { text: 'Стань #1' },
    CHANNEL_GATE,
  ],
};

// Keyword → the screen where that action is performed (first match wins). Drives
// the inline "go there" nav button on each step, for easy navigation.
const STEP_HREF_RULES: { match: RegExp; href: Route }[] = [
  { match: /Купи/i, href: routes.market() },
  { match: /реклам/i, href: routes.tasks },
  { match: /(Поделись|Пригласи|реферал|друз)/i, href: routes.inviteFriends },
  { match: /(кошел|TON|Обменяй|Lucky Stars)/i, href: routes.wallet },
  { match: /профил/i, href: routes.profile.index },
  { match: /стейк/i, href: routes.stakes.index },
  { match: /(Silver|Gold|Platinum|статус)/i, href: routes.settings.vip },
  { match: /(движок|апгрейд|прокач|скорост|вместимост)/i, href: routes.home },
  { match: /(Потрать|турнир)/i, href: routes.tournaments.index },
  { match: /билет/i, href: routes.tickets.index },
];

const hrefForStep = (text: string): Route | undefined =>
  STEP_HREF_RULES.find(r => r.match.test(text))?.href;

// Pull the count out of a core "verb N unit" step → { label (number-less), target }.
// The target renders as a "done / target" progress badge at the row's end. Ranks
// (топ-N, #1) and one-off actions carry no count and keep their text unchanged.
const COUNT_RULES: { re: RegExp; label: string }[] = [
  { re: /^Потрать\s+(\d+)\s+билет/i, label: 'Потрать билеты' },
  { re: /^Посмотри\s+(\d+)\s+реклам/i, label: 'Посмотри рекламу' },
  { re: /^Поделись с друзьями\s+(\d+)\s+раз/i, label: 'Поделись с друзьями' },
  { re: /^Заведи\s+(\d+)\s+реферал/i, label: 'Заведи рефералов' },
  { re: /^Забери\s+(\d+)\s+билет\w*\s+с движка/i, label: 'Забери билеты с движка' },
];

const parseCount = (text: string): { label: string; target?: number } => {
  for (const { re, label } of COUNT_RULES) {
    const m = re.exec(text);
    if (m) return { label, target: Number(m[1]) };
  }
  // "Держи N … стейк…" → hold-count.
  const stake = /^Держи\s+(\d+)\s+.*стейк/i.exec(text);
  if (stake) return { label: 'Держи активные стейки', target: Number(stake[1]) };
  // Trailing "… N раз(а)" (e.g. engine-upgrade repeats) → strip the count.
  const rep = /^(.+?)\s+(\d+)\s+раза?$/i.exec(text);
  if (rep) return { label: rep[1], target: Number(rep[2]) };
  return { label: text };
};

/**
 * Resolve the checklist for a level. Prefers an authored override; otherwise
 * splits the one-line `task` on " · " / " + ". Core count steps get their number
 * pulled into `target` (rendered as a "done / target" badge); every non-gate step
 * gets an auto-resolved deep-link for its inline nav button. Front-end prototype
 * until the backend ships real per-step progress.
 */
export const resolveTestQuestSteps = (level: number, task: string): TestQuestStep[] => {
  const override = TEST_QUEST_STEP_OVERRIDES[level];
  const steps =
    override ??
    task
      .split(/\s*[·+]\s*/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(text => ({ text }));
  return steps.map(step => {
    if (step.gate === 'channel') return step;
    const { label, target } = parseCount(step.text);
    return { ...step, text: label, target, href: step.href ?? hrefForStep(label) };
  });
};
