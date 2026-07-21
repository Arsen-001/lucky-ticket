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

/** Full ladder, level 31 (entry) down to level 1 (top crown). */
export const testQuestLadder: TestQuestLevel[] = [
  {
    level: 31,
    day: null,
    task: 'Старт',
    drop: '500k LC · 10 билетов · LP 3д · 10 LS',
    zone: 'entry',
  },
  {
    level: 30,
    day: 1,
    task: 'Раскачай движок',
    drop: '200k LC · 5 билетов · +10 AP',
    zone: 'ladder',
  },
  {
    level: 29,
    day: 2,
    task: 'Реклама и билеты',
    drop: '200k LC · 5 билетов · 5 LS',
    zone: 'ladder',
  },
  {
    level: 28,
    day: 3,
    task: 'Движок и профиль',
    drop: '250k LC · 5 билетов · +15 AP',
    zone: 'ladder',
  },
  {
    level: 27,
    day: 4,
    task: 'Собери 8 билетов',
    drop: '300k LC · 8 билетов · LP 2д',
    zone: 'ladder',
  },
  {
    level: 26,
    day: 5,
    task: 'Пригласи 1 друга',
    drop: '400k LC · 10 билетов · 20 LS',
    zone: 'wall',
  },
  {
    level: 25,
    day: 6,
    task: 'Апгрейдни движок',
    drop: '400k LC · 10 билетов · +20 AP',
    zone: 'ladder',
  },
  { level: 24, day: 7, task: 'Кошелёк и звёзды', drop: '300k LC · 30 LS · +20 AP', zone: 'ladder' },
  {
    level: 23,
    day: 8,
    task: 'Сыграй турнир',
    drop: '500k LC · 10 билетов · 25 LS',
    zone: 'ladder',
  },
  {
    level: 22,
    day: 9,
    task: 'Посмотри 10 реклам',
    drop: '400k LC · 10 билетов · LP 3д',
    zone: 'ladder',
  },
  {
    level: 21,
    day: 10,
    task: 'Сделай первый стейк',
    drop: '600k LC · 15 билетов · 30 LS',
    zone: 'ladder',
  },
  {
    level: 20,
    day: 11,
    task: 'Достигни Silver',
    drop: '750k LC · 15 билетов · 1 движок',
    zone: 'wall',
  },
  {
    level: 19,
    day: 12,
    task: '3 друга суммарно',
    drop: '700k LC · 15 билетов · 40 LS',
    zone: 'wall',
  },
  {
    level: 18,
    day: 13,
    task: 'Выиграй турнир (топ-3)',
    drop: '800k LC · 20 билетов · LP 5д',
    zone: 'ladder',
  },
  {
    level: 17,
    day: 14,
    task: 'Собери 20 билетов',
    drop: '700k LC · 15 билетов · 50 LS',
    zone: 'ladder',
  },
  {
    level: 16,
    day: 15,
    task: '5 друзей суммарно',
    drop: '1M LC · 20 билетов · 50 LS',
    zone: 'wall',
  },
  { level: 15, day: 16, task: 'Достигни Gold', drop: '1M LC · 20 билетов · LP 7д', zone: 'wall' },
  {
    level: 14,
    day: 17,
    task: 'Выиграй 3 турнира суммарно',
    drop: '900k LC · 20 билетов · 60 LS',
    zone: 'ladder',
  },
  {
    level: 13,
    day: 18,
    task: '200 реклам суммарно',
    drop: '800k LC · 15 билетов · 75 LS',
    zone: 'ladder',
  },
  {
    level: 12,
    day: 19,
    task: '7 друзей суммарно',
    drop: '1.2M LC · 25 билетов · 1 движок',
    zone: 'wall',
  },
  {
    level: 11,
    day: 20,
    task: '2 активных стейка',
    drop: '1M LC · 20 билетов · 80 LS',
    zone: 'ladder',
  },
  {
    level: 10,
    day: 21,
    task: '10 друзей суммарно',
    drop: '1.5M LC · 25 билетов · 100 LS · LP 14д',
    zone: 'wall',
  },
  {
    level: 9,
    day: 22,
    task: 'Держи Gold + выиграй Gold-турнир',
    drop: '1.5M LC · 25 билетов · 100 LS',
    zone: 'ladder',
  },
  {
    level: 8,
    day: 23,
    task: 'Топ-10 в турнире',
    drop: '1.3M LC · 25 билетов · 120 LS',
    zone: 'ladder',
  },
  {
    level: 7,
    day: 24,
    task: '15 друзей суммарно',
    drop: '2M LC · 30 билетов · 150 LS',
    zone: 'wall',
  },
  {
    level: 6,
    day: 25,
    task: '300 реклам суммарно',
    drop: '1.5M LC · 25 билетов · 150 LS · 1 движок',
    zone: 'ladder',
  },
  {
    level: 5,
    day: 26,
    task: '18 друзей суммарно',
    drop: '3M LC · 40 билетов · 200 LS',
    zone: 'wall',
  },
  {
    level: 4,
    day: 27,
    task: 'Достигни Platinum · квалификация',
    drop: '3M LC · 40 билетов · LP 30д',
    zone: 'wall',
  },
  {
    level: 3,
    day: null,
    task: 'Корона · топ-50 по друзьям',
    drop: '4M LC · 45 билетов · 300 LS',
    zone: 'crown',
  },
  {
    level: 2,
    day: null,
    task: 'Корона · топ-10',
    drop: '4.5M LC · 50 билетов · VIP 1 · 250 LS',
    zone: 'crown',
  },
  {
    level: 1,
    day: null,
    task: 'Корона · #1',
    drop: '5M LC · 50 билетов · 500 LS · VIP 3 · именная печать',
    zone: 'crown',
  },
];

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
}

// The daily channel check-in closes almost every level — one shared step.
const CHECKIN: TestQuestStep = {
  text: 'Сделай дневной чек-ин',
  detail: 'Каждый день проверяется подписка на канал @luckyticket365.',
};

// Authored, real-only checklist per level (31 → 1). Every step is a working
// in-app action; steps with `detail`/`subSteps` expand into how-to dropdowns.
// Difficulty escalates toward level 1. Front-end prototype until the backend
// owns per-step data. 31/30 are user-dictated; 29 → 1 authored here.
const TEST_QUEST_STEP_OVERRIDES: Record<number, TestQuestStep[]> = {
  // 31 · entry
  31: [
    { text: 'Забери 1 билет с движка' },
    { text: 'Вступи в 1 турнир' },
    { text: 'Посмотри 1 рекламу' },
    {
      text: 'Поделись с друзьями',
      detail: 'Засчитывается сам факт отправки (не обязательно, чтобы друг зашёл).',
    },
  ],
  // 30 · day 1 — ticket · engine upgrade (LS-priced — grant the stars, never force
  // a purchase) · 2+ ads · daily check-in · share
  30: [
    { text: 'Забери билет с движка' },
    {
      text: 'Апгрейдни движок',
      detail: 'Открой движок на главной → апгрейд скорости или вместимости (за LS).',
    },
    { text: 'Посмотри минимум 2 рекламы' },
    CHECKIN,
    {
      text: 'Поделись с друзьями',
      subSteps: ['Открой «Пригласить»', 'Отправь ссылку в Telegram'],
    },
  ],
  // 29 · day 2
  29: [
    { text: 'Посмотри 3 рекламы' },
    { text: 'Забери 2 билета с движков' },
    {
      text: 'Собери 5 билетов за день',
      detail: 'Забирай с движков; не хватает — докупи в маркете.',
    },
    {
      text: 'Пригласи 1 друга',
      subSteps: ['Открой «Пригласить»', 'Отправь ссылку в Telegram', 'Друг заходит и активируется'],
    },
    CHECKIN,
  ],
  // 28 · day 3
  28: [
    {
      text: 'Апгрейдни вместимость движка',
      detail: 'Открой движок на главной → +вместимость (за LS).',
    },
    { text: 'Забери 3 билета за день' },
    { text: 'Посмотри 3 рекламы' },
    { text: 'Оформи профиль — аватар и никнейм', detail: 'Профиль → фото и имя.' },
    CHECKIN,
  ],
  // 27 · day 4
  27: [
    {
      text: 'Собери 8 билетов за день',
      detail: 'Забирай с движков + докупи недостающие в маркете.',
    },
    { text: 'Апгрейдни скорость движка' },
    { text: 'Посмотри 4 рекламы' },
    { text: 'Сыграй ещё один турнир' },
    CHECKIN,
  ],
  // 26 · day 5 — first-friend wall
  26: [
    {
      text: 'Пригласи 1 активного друга',
      subSteps: [
        'Скопируй ссылку или карточку',
        'Отправь другу в Telegram',
        'Друг заходит и активируется',
      ],
    },
    { text: 'Посмотри 5 реклам' },
    { text: 'Собери 10 билетов за день' },
    { text: 'Вступи в турнир и дождись результата' },
    CHECKIN,
  ],
  // 25 · day 6
  25: [
    { text: 'Прокачай движок ещё на уровень', detail: 'Скорость или вместимость (за LS).' },
    { text: 'Собери 10 билетов за день' },
    { text: 'Посмотри 5 реклам' },
    {
      text: 'Заработай 500 очков активности (AP)',
      detail: 'AP капают за движки, турниры, друзей и награды.',
    },
    CHECKIN,
  ],
  // 24 · day 7 — a week in
  24: [
    { text: 'Подключи TON-кошелёк', detail: 'Кошелёк → подключить TON.' },
    { text: 'Обменяй TON в Lucky Stars', detail: 'Кошелёк → обмен: TON → Lucky Stars.' },
    { text: 'Собери 12 билетов за день' },
    { text: 'Посмотри 6 реклам' },
    CHECKIN,
  ],
  // 23 · day 8
  23: [
    { text: 'Сыграй турнир', detail: 'Выбери тир, поставь билет, дождись финиша.' },
    { text: 'Доведи активных друзей до 2' },
    { text: 'Собери 10 билетов за день' },
    { text: 'Посмотри 6 реклам' },
    CHECKIN,
  ],
  // 22 · day 9
  22: [
    { text: 'Посмотри 10 реклам', detail: 'До 10 в день — можно за один заход.' },
    { text: 'Собери 10 билетов за день' },
    { text: 'Сыграй ещё турнир' },
    { text: 'Заработай 800 AP суммарно' },
    CHECKIN,
  ],
  // 21 · day 10 — first stake
  21: [
    {
      text: 'Сделай первый стейк',
      subSteps: ['Стейки → «Новый»', 'Выбери сумму LC и срок', 'Подтверди — AP начислится сразу'],
    },
    { text: 'Собери 15 билетов за день' },
    { text: 'Посмотри 7 реклам' },
    { text: 'Пригласи ещё друга' },
    CHECKIN,
  ],
  // 20 · day 11 — Silver wall
  20: [
    { text: 'Достигни статуса Silver', detail: 'Статус растёт от активности и AP.' },
    { text: 'Собери 15 билетов за день' },
    { text: 'Посмотри 7 реклам' },
    { text: 'Сыграй турнир' },
    CHECKIN,
  ],
  // 19 · day 12 — 3 friends
  19: [
    { text: 'Доведи активных друзей до 3', detail: 'Считаются активированные с начала теста.' },
    { text: 'Посмотри 8 реклам' },
    { text: 'Собери 15 билетов за день' },
    { text: 'Сыграй турнир своего тира' },
    CHECKIN,
  ],
  // 18 · day 13 — podium
  18: [
    { text: 'Займи топ-3 в турнире', detail: 'Награда — за место 1–3.' },
    { text: 'Собери 15 билетов за день' },
    { text: 'Посмотри 8 реклам' },
    { text: 'Пригласи ещё друга' },
    CHECKIN,
  ],
  // 17 · day 14
  17: [
    { text: 'Собери 20 билетов за день', detail: 'Ускорься апгрейдом или вторым движком.' },
    { text: 'Посмотри 8 реклам' },
    { text: 'Сыграй турнир' },
    { text: 'Заработай 1000 AP суммарно' },
    CHECKIN,
  ],
  // 16 · day 15 — 5 friends
  16: [
    { text: 'Доведи активных друзей до 5' },
    { text: 'Собери 20 билетов за день' },
    { text: 'Посмотри 9 реклам' },
    { text: 'Сыграй турнир своего тира' },
    CHECKIN,
  ],
  // 15 · day 16 — Gold wall
  15: [
    { text: 'Достигни статуса Gold', detail: 'Статус растёт от активности и AP.' },
    { text: 'Собери 20 билетов за день' },
    { text: 'Посмотри 9 реклам' },
    { text: 'Держи активный стейк' },
    CHECKIN,
  ],
  // 14 · day 17
  14: [
    { text: 'Набери 3 победы в турнирах за тест' },
    { text: 'Собери 20 билетов за день' },
    { text: 'Посмотри 9 реклам' },
    { text: 'Пригласи ещё друга' },
    CHECKIN,
  ],
  // 13 · day 18 — 200 ads total
  13: [
    {
      text: 'Доведи суммарные просмотры рекламы до 200',
      detail: 'Смотри до 10/день — держи темп.',
    },
    { text: 'Собери 15 билетов за день' },
    { text: 'Сыграй турнир' },
    { text: 'Заработай 1500 AP суммарно' },
    CHECKIN,
  ],
  // 12 · day 19 — 7 friends
  12: [
    { text: 'Доведи активных друзей до 7' },
    { text: 'Собери 25 билетов за день' },
    { text: 'Посмотри 10 реклам' },
    { text: 'Запусти новый движок', detail: 'Награда уровня даёт движок — запусти его в работу.' },
    CHECKIN,
  ],
  // 11 · day 20 — two stakes
  11: [
    { text: 'Держи 2 активных стейка одновременно', detail: 'Оба активны в один момент.' },
    { text: 'Собери 20 билетов за день' },
    { text: 'Посмотри 10 реклам' },
    { text: 'Сыграй турнир' },
    CHECKIN,
  ],
  // 10 · day 21 — 10 friends
  10: [
    { text: 'Доведи активных друзей до 10' },
    { text: 'Собери 25 билетов за день' },
    { text: 'Посмотри 10 реклам' },
    { text: 'Займи топ-3 в турнире' },
    CHECKIN,
  ],
  // 9 · day 22
  9: [
    { text: 'Выиграй турнир Gold-тира', detail: 'Держи Gold и возьми первое место.' },
    { text: 'Держи статус Gold' },
    { text: 'Собери 25 билетов за день' },
    { text: 'Посмотри 10 реклам' },
    CHECKIN,
  ],
  // 8 · day 23
  8: [
    { text: 'Войди в топ-10 крупного турнира' },
    { text: 'Собери 25 билетов за день' },
    { text: 'Посмотри 10 реклам' },
    { text: 'Держи активный стейк' },
    CHECKIN,
  ],
  // 7 · day 24 — 15 friends
  7: [
    { text: 'Доведи активных друзей до 15' },
    { text: 'Собери 30 билетов за день' },
    { text: 'Посмотри 10 реклам' },
    { text: 'Сыграй турнир высокого тира' },
    CHECKIN,
  ],
  // 6 · day 25 — 300 ads total
  6: [
    { text: 'Доведи суммарные просмотры рекламы до 300' },
    { text: 'Запусти ещё один движок', detail: 'Награда уровня даёт движок.' },
    { text: 'Собери 25 билетов за день' },
    { text: 'Пригласи ещё друга' },
    CHECKIN,
  ],
  // 5 · day 26 — 18 friends
  5: [
    { text: 'Доведи активных друзей до 18' },
    { text: 'Собери 40 билетов за день' },
    { text: 'Посмотри 10 реклам' },
    { text: 'Выиграй турнир' },
    CHECKIN,
  ],
  // 4 · day 27 — Platinum + qualification
  4: [
    { text: 'Прокачай статус до Platinum', detail: 'Platinum — порог квалификации на корону.' },
    { text: 'Собери 40 билетов за день' },
    { text: 'Держи 2 активных стейка' },
    { text: 'Заверши все дневные задания за день' },
    {
      text: 'Квалификация на корону открыта',
      detail: 'Дальше корону 3 → 1 решает «Топ по друзьям».',
    },
  ],
  // 3 → 1 · crown — decided by the friends leaderboard (activated referrals) at test end
  3: [
    {
      text: 'Войди в топ-50 «Топ по друзьям»',
      detail: 'Корона присуждается в конце теста по числу активированных друзей.',
    },
    { text: 'Приглашай активных друзей каждый день' },
  ],
  2: [
    { text: 'Войди в топ-10 «Топ по друзьям»' },
    { text: 'Гонка решается в последний день теста — держи темп' },
  ],
  1: [
    { text: 'Стань #1 в «Топ по друзьям»' },
    { text: '#1 по активированным друзьям на момент заморозки берёт корону' },
  ],
};

/**
 * Resolve the checklist for a level. Prefers an authored override; otherwise
 * splits the one-line `task` into plain steps on " · " / " + ". Front-end
 * prototype until the backend ships real per-step data.
 */
export const resolveTestQuestSteps = (level: number, task: string): TestQuestStep[] => {
  const override = TEST_QUEST_STEP_OVERRIDES[level];
  if (override) return override;
  return task
    .split(/\s*[·+]\s*/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(text => ({ text }));
};
